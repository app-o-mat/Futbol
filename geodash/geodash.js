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
    this.platforms = [];
    this.platformConfigs = [];
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

    // Create floating platforms
    const platformHeight = 32;
    const lastSpikeX = spikeBaseX + (3 * 500); // Position of last spike
    
    // Platform data: {x, width, height}
    const platformConfigs = [
      { x: lastSpikeX + 400, width: 256, heightAboveFloor: 64 },
      { x: lastSpikeX + 700, width: 128, heightAboveFloor: 128 },
      { x: lastSpikeX + 950, width: 64, heightAboveFloor: 192 }
    ];
    
    for (let config of platformConfigs) {
      const platformY = floorY - config.heightAboveFloor - platformHeight / 2;
      const platform = this.add.rectangle(config.x, platformY, config.width, platformHeight, 0x333333);
      this.platforms.push(platform);
      this.platformConfigs.push({
        platform: platform,
        width: config.width,
        platformY: platformY
      });
    }

    // Set up camera to follow player
    this.cameras.main.setBounds(0, 0, worldWidth, gameHeight);
    this.cameras.main.startFollow(this.player);

    // Set up keyboard input for SPACE
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.isJumping && !this.gameOver) {
        this.isJumping = true;
        this.playerVelocityY = -10.0 ; // Jump velocity for 256px height
      }
    });
  }

  update() {
    if (!this.gameOver) {
      // Apply constant forward velocity (200 pixels per second)
      this.playerX += 200 * (1 / 60); // Assuming 60 FPS

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

      // Check collision with spikes
      const playerSize = 32;
      const spikeHeight = 32 * Math.sqrt(3) / 2;
      
      for (let spike of this.spikes) {
        if (
          this.playerX < spike.x + 16 &&
          this.playerX + playerSize > spike.x - 16 &&
          this.playerY < spike.y + spikeHeight / 2 &&
          this.playerY + playerSize > spike.y - spikeHeight / 2
        ) {
          // Collision detected - restart the game
          this.scene.restart();
          return;
        }
      }

      // Check collision with floating platforms
      const floorY = gameHeight - 30;
      let onPlatform = false;
      for (let config of this.platformConfigs) {
        const platformWidth = config.width;
        const platformY = config.platformY;
        
        if (
          this.playerX < config.platform.x + platformWidth / 2 &&
          this.playerX + playerSize > config.platform.x - platformWidth / 2 &&
          this.playerY + playerSize >= platformY - 16 &&
          this.playerY + playerSize <= platformY + 16 &&
          this.playerVelocityY >= 0
        ) {
          // Player is on platform
          this.playerY = platformY - 16 - playerSize / 2;
          this.isJumping = false;
          this.playerVelocityY = 0;
          onPlatform = true;
        }
      }

      // If not on platform or floor, apply gravity for falling
      if (!onPlatform && this.playerY < floorY - 31) {
        this.isJumping = true;
      }

      // Check collision with flag
      const flagWidth = 40;
      const flagHeight = 60;
      
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
