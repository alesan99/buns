export function createHelloWorldGame(
  Phaser: typeof import("phaser"),
  mountNode: HTMLElement,
) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: mountNode,
    backgroundColor: "#fdf8f2",
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: mountNode.clientWidth || 1,
      height: mountNode.clientHeight || 1,
    },
    scene: {
      create() {
        this.cameras.main.setBackgroundColor("#fdf8f2");

        const frame = this.add
          .rectangle(0, 0, 0, 0, 0xfffefb)
          .setStrokeStyle(2, 0xe4d8cc);

        const shadow = this.add.ellipse(0, 0, 0, 0, 0x786e66, 0.14).setAlpha(0.14);

        const title = this.add.text(0, 0, "Hello, Phaser", {
          color: "#2c2420",
          fontFamily: "system-ui, sans-serif",
          fontSize: "44px",
          fontStyle: "700",
        });
        title.setOrigin(0.5);

        const accent = this.add
          .rectangle(0, 0, 0, 0, 0xc8a260)
          .setAlpha(0.8);

        const layout = (width: number, height: number) => {
          const inset = 18;
          const base = Math.min(width, height);

          frame.setPosition(width / 2, height / 2);
          frame.setSize(Math.max(width - inset * 2, 1), Math.max(height - inset * 2, 1));

          shadow.setPosition(width / 2, height / 2 + base * 0.22);
          shadow.setSize(base * 0.42, Math.max(base * 0.065, 10));

          accent.setPosition(width / 2, height / 2 - base * 0.19);
          accent.setSize(base * 0.24, Math.max(base * 0.022, 8));

          title.setPosition(width / 2, height / 2 - base * 0.02);
          title.setFontSize(Math.max(Math.round(base * 0.095), 26));
        };

        layout(this.scale.width, this.scale.height);
        this.scale.on("resize", (size: { width: number; height: number }) => {
          layout(size.width, size.height);
        });

        this.tweens.add({
          targets: [title, accent],
          y: "-=8",
          duration: 1400,
          ease: "Sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        this.tweens.add({
          targets: shadow,
          scaleX: 1.08,
          scaleY: 0.92,
          alpha: 0.1,
          duration: 1400,
          ease: "Sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        frame.setDepth(1);
        title.setDepth(2);
        accent.setDepth(2);
      },
    },
  });
}