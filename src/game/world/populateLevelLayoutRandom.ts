import {
  OBJECT_COLLECTIBLE,
  OBJECT_NONE,
  OBJECT_SPAWN,
  type LevelGrid,
  TILE_SOLID,
} from "@/game/config";

const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

function fract(n: number): number {
  return n - Math.floor(n);
}

function valueNoise(x: number, seed: number): number {
  const xi = Math.floor(x);
  const xf = x - xi;
  const h0 = fract(Math.sin((xi + seed) * 127.1) * 43758.545);
  const h1 = fract(Math.sin((xi + 1 + seed) * 127.1) * 43758.545);
  const t = xf * xf * (3 - 2 * xf);
  return h0 + (h1 - h0) * t;
}

function fbm(
  x: number,
  seed: number,
  octaves = 4,
  lacunarity = 2.5,
  gain = 0.5,
): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise(x * frequency, seed + i * 31);
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value;
}

function gaussian(distance: number, sigma: number): number {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function populateLevelLayoutRandom(
  layout: LevelGrid,
  rng: () => number = Math.random,
): LevelGrid {
  const height = layout.height;
  const width = layout.width;
  if (height < 4 || width < 4) return layout;

  const floorRow = height - 1;
  const spawnRow = height - 2;
  const seed = rng() * 1000;

  // ── Reset pass ────────────────────────────────────────────────────────────
  for (let row = 0; row < height - 1; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const object =
        row === spawnRow && layout.getTile(row, col, 1) === OBJECT_SPAWN
          ? OBJECT_SPAWN
          : OBJECT_NONE;
      layout.setTile(row, col, 0);
      layout.setTile(row, col, object, 1);
    }
  }

  // ── Tuning ────────────────────────────────────────────────────────────────

  // Horizontal spread
  const hSigmaBottom = width * 0.1;
  const hSigmaTop    = width * 0.04;

  // Solid threshold
  const hThresholdBottom = 0.25;
  const hThresholdTop    = 0.55;

  // Vertical thickness: the per-pass cap. Per-column thickness is additionally
  // scaled by hWeight so edges are thinner than the center, giving a round profile.
  const maxThicknessBottom = 4;
  const maxThicknessTop    = 1;

  // vSigma: larger = softer underside taper, rounder belly on thick platforms.
  const vSigmaBottom = 3.5;
  const vSigmaTop    = 1.2;

  const collectibleChance = 0.45;

  // Warp amplitude: subtle at the floor, aggressive at the top.
  const warpAmpBottom = 1;
  const warpAmpTop    = 3;

  // Warp noise frequency: smooth at the bottom, detailed at the top.
  const warpFreqBottom = 0.5;
  const warpFreqTop    = 1.8;

  const topOccupiedRow = new Array(width).fill(floorRow);

  let row = floorRow - 3;
  let passIndex = 0;
  let prevCenterCol = -1;

  while (row > 2) {
    const noiseX = passIndex * 1.8;
    let centerCol = Math.round(fbm(noiseX, seed) * (width - 1));

    // Force a minimum horizontal distance from the previous platform.
    if (prevCenterCol !== -1) {
      const minOffset = Math.floor(width * 0.25);
      if (Math.abs(centerCol - prevCenterCol) < minOffset) {
        centerCol = prevCenterCol > width / 2
          ? randInt(rng, 0, Math.floor(width * 0.4))
          : randInt(rng, Math.floor(width * 0.6), width - 1);
      }
    }

    prevCenterCol = centerCol;

    // heightT: 0.0 at the floor, 1.0 at the top of the level.
    const heightT = 1 - (row / floorRow);

    // All per-pass parameters scale with heightT.
    const hSigma         = lerp(hSigmaBottom,         hSigmaTop,         heightT);
    const hThreshold     = lerp(hThresholdBottom,     hThresholdTop,     heightT);
    const maxThickness   = Math.round(lerp(maxThicknessBottom, maxThicknessTop, heightT));
    const vSigma         = lerp(vSigmaBottom,         vSigmaTop,         heightT);
    const surfaceWarpAmp = lerp(warpAmpBottom,         warpAmpTop,        heightT);
    const warpFreq       = lerp(warpFreqBottom,        warpFreqTop,       heightT);

    let collectibleCol = centerCol;
    let collectibleRow = row - 1;

    for (let col = 0; col < width; col += 1) {
      const hWeight = gaussian(col - centerCol, hSigma);
      if (hWeight < hThreshold) continue;

      // Scale thickness by horizontal weight: center columns get the full
      // budget, edge columns get proportionally fewer depth layers.
      // This produces a rounded cross-section instead of a flat-bottomed rectangle.
      const colThickness = Math.max(1, Math.round(maxThickness * hWeight));

      const warpNoise = fbm(col * warpFreq, seed + passIndex * 17);
      const warpOffset = Math.round((warpNoise - 0.5) * 2 * surfaceWarpAmp);
      const surfaceRow = row + warpOffset;

      for (let depth = 0; depth < colThickness; depth += 1) {
        const tileRow = surfaceRow + depth;
        if (tileRow >= floorRow || tileRow < 1) continue;

        const vWeight = gaussian(depth, vSigma);
        if (vWeight < 0.5) continue;

        // ── Gap enforcement ──────────────────────────────────────────────
        if (tileRow >= topOccupiedRow[col] - 1) continue;

        layout.setTile(tileRow, col, TILE_SOLID);

        if (tileRow < topOccupiedRow[col]) {
          topOccupiedRow[col] = tileRow;
        }
      }

      if (col === centerCol) {
        const warp = Math.round((fbm(col * warpFreq, seed + passIndex * 17) - 0.5) * 2 * surfaceWarpAmp);
        collectibleRow = row + warp - 1;
      }
    }

    // ── Collectible above the platform peak ───────────────────────────────
    if (collectibleRow > 1 && rng() < collectibleChance) {
      if (layout.getTile(collectibleRow, collectibleCol, 1) === OBJECT_NONE) {
        layout.setTile(collectibleRow, collectibleCol, OBJECT_COLLECTIBLE, 1);
      }
    }

    // ── Vertical step ─────────────────────────────────────────────────────
    const stepNoise = fbm(noiseX + 99, seed);
    const step = 2 + Math.round(stepNoise * 2);
    row -= step;
    passIndex += 1;
  }

  return layout;
}