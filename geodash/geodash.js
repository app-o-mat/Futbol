/* global Phaser */

var game = undefined;
var gameWidth = 800;
var gameHeight = 600;
var worldWidth = gameWidth * 5;

class GeoDashGame extends Phaser.Scene {
  constructor() {
    super();
    this.playerY = 0;
    this.isJumping = false;
    this.playerVelocityY = 0;
    this.gameOver = false;
  }

  preload() {
    // No assets to load for now
  }

  create() {
    // Set background to blue
    this.cameras.main.setBackgroundColor('#0066cc');

    // Create floor (extends across entire world)
    const floorY = gameHeight - 30;
    this.floor = this.add.rectangle(worldWidth / 2, floorY, worldWidth, 30, 0x8b7355);

    // Create player (32x32 red square)
    this.playerX = 100;
    this.playerY = floorY - 31;
    this.player = this.add.rectangle(this.playerX, this.playerY, 32, 32, 0xff0000);

    // Create spikes array
    this.spikes = [];
    const spikeHeight = 32 * Math.sqrt(3) / 2;
    const spikeBaseX = 600;
    
    for (let i = 0; i < 4; i++) {
      const spikeX = spikeBaseX + (i * 500);
      const spikeY = floorY - spikeHeight / 2;
      const spikePoints = [
        [0, -spikeHeight / 2], // Top point
        [-16, spikeHeight / 2], // Bottom-left
        [16, spikeHeight / 2]   // Bottom-right
      ];
      const spike = this.add.polygon(spikeX, spikeY, spikePoints, 0xff6600);
      this.spikes.push(spike);
    }

    // Create flag at the end of the floor
    const flagX = worldWidth - 100;
    const flagY = floorY - 80;
    this.flag = this.add.rectangle(flagX, flagY, 40, 60, 0xffff00);

    // Set up camera to follow player
    this.cameras.main.setBounds(0, 0, worldWidth, gameHeight);
    this.cameras.main.startFollow(this.player);

    // Set up keyboard input for SPACE
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.isJumping && !this.gameOver) {
        this.isJumping = true;
        this.playerVelocityY = -8; // Jump velocity
      }
    });
  }

  update() {
    if (!this.gameOver) {
      // Apply constant forward velocity (100 pixels per second)
      this.playerX += 100 * (1 / 60); // Assuming 60 FPS

      // Apply jump physics
      if (this.isJumping) {
        this.playerVelocityY += 0.4;
        this.playerY += this.playerVelocityY;

        // Check if player hits the floor
        const floorY = gameHeight - 30;
        if (this.playerY >= floorY - 31) {
          this.playerY = floorY - 31;
          this.isJumping = false;
          this.playerVelocityY = 0;
        }
      }

      // Update player position
      this.player.setPosition(this.playerX, this.playerY);

      // Check collision with flag
      const flagWidth = 40;
      const flagHeight = 60;
      const playerSize = 32;
      
      if (
        this.playerX < this.flag.x + flagWidth / 2 &&
        this.playerX + playerSize > this.flag.x - flagWidth / 2 &&
        this.playerY < this.flag.y + flagHeight / 2 &&
        this.playerY + playerSize > this.flag.y - flagHeight / 2
      ) {
        this.gameOver = true;
      }
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
