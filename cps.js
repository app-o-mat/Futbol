/* global Phaser */

var game = undefined;
var gameWidth = 800;
var gameHeight = 600;

class CPSGame extends Phaser.Scene {
  constructor() {
    super();
    this.clicks = 0;
    this.timeLeft = 10;
    this.gameStarted = false;
    this.timerEvent = null;
  }

  preload() {
    // No assets to load for now
  }

  create() {
    // Set background to black
    this.cameras.main.setBackgroundColor('#000000');

    // Add a 64x64 white circle in the center
    this.circle = this.add.circle(gameWidth / 2, gameHeight / 2, 150, 0xffffff);

    // Add random color outline circle
    let randomColor = Phaser.Display.Color.HSLToColor(Math.random(), 1, 0.5);
    this.colorCircle = this.add.circle(gameWidth / 2, gameHeight / 2, 1, randomColor, 0);
    this.colorCircle.setStrokeStyle(2, randomColor.color);

    // Make the circle interactive
    this.circle.setInteractive();

    // Add click event
    this.circle.on('pointerdown', () => {
      if (this.timeLeft > 0) {
        if (!this.gameStarted) {
          this.gameStarted = true;
          this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
          });
        }
        this.clicks++;
        this.clicksText.setText('Clicks: ' + this.clicks);

        // Add animated click circle
        let clickX = this.input.activePointer.x;
        let clickY = this.input.activePointer.y;
        let randomColor = Phaser.Display.Color.HSLToColor(Math.random(), 1, 0.5);
        let clickCircle = this.add.circle(clickX, clickY, 0, randomColor.color, 0.5);
        clickCircle.setStrokeStyle(2, randomColor.color);
        this.tweens.add({
          targets: clickCircle,
          radius: 150,
          duration: 200,
          onComplete: () => clickCircle.destroy()
        });
      }
    });
    // Add clicks counter label
    this.clicksText = this.add.text(10, 10, 'Clicks: 0', { fontSize: '24px', fill: '#ffffff' });

    // Add timer label
    this.timerText = this.add.text(gameWidth / 2, 10, '10 seconds', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5, 0);

    // Add reset button
    this.resetButton = this.add.text(gameWidth - 100, 10, 'Reset', { fontSize: '24px', fill: '#ffffff' });
    this.resetButton.setInteractive();
    this.resetButton.on('pointerdown', () => {
      this.clicks = 0;
      this.clicksText.setText('Clicks: 0');
      this.timeLeft = 10;
      this.timerText.setText('10 seconds');
      this.gameStarted = false;
      this.colorCircle.setRadius(1);
      if (this.timerEvent) {
        this.timerEvent.remove();
        this.timerEvent = null;
      }
    });
  }

  update() {
    // Game logic will go here
  }

  updateTimer() {
    this.timeLeft--;
    this.timerText.setText(this.timeLeft + ' seconds');
    if (this.timeLeft <= 0) {
      this.timerEvent.remove();
      this.timerEvent = null;
      this.gameStarted = false; // Allow restarting
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: CPSGame,
};

game = new Phaser.Game(config);