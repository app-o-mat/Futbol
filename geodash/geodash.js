/* global Phaser */

var game = undefined;
var gameWidth = 800;
var gameHeight = 600;

class GeoDashGame extends Phaser.Scene {
  constructor() {
    super();
    this.playerY = 0;
    this.isJumping = false;
  }

  preload() {
    // No assets to load for now
  }

  create() {
    // Set background to blue
    this.cameras.main.setBackgroundColor('#0066cc');

    // Create floor
    const floorY = gameHeight - 30;
    this.floor = this.add.rectangle(gameWidth / 2, floorY, gameWidth, 30, 0x8b7355);

    // Create player (32x32 red square)
    this.playerX = 100;
    this.playerY = floorY - 31;
    this.player = this.add.rectangle(this.playerX, this.playerY, 32, 32, 0xff0000);

    // Set up keyboard input for SPACE
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.isJumping) {
        this.isJumping = true;
        this.playerVelocityY = -8; // Jump velocity
      }
    });
  }

  update() {
    if (this.isJumping) {
      // Apply gravity
      this.playerVelocityY += 0.4;
      this.playerY += this.playerVelocityY;

      // Check if player hits the floor
      const floorY = gameHeight - 30;
      if (this.playerY >= floorY - 31) {
        this.playerY = floorY - 31;
        this.isJumping = false;
        this.playerVelocityY = 0;
      }

      this.player.setY(this.playerY);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: GeoDashGame,
};

game = new Phaser.Game(config);
