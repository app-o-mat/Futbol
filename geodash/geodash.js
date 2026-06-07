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
    this.spikes = [];
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

    // Platforms are created from `platformPositions` below
    // Create flag at the end of the floor
    const flagX = worldWidth - 100;
    const flagY = floorY - 80;
    this.flag = this.add.rectangle(flagX, flagY, 40, 60, 0xffff00);

    // Create configurable platforms from an array of {x, y, width}
    const platformHeight = 32;
    const defaultWidth = 200;

    const platformASCII = `
                                ####
           ####         ##
    ####          ####      #      
             ^                         ^`;

    // Parse ASCII art to generate platform and spike positions
    const { platforms: platformPositions, spikes: spikePositions } = this.parsePlatformASCII(platformASCII, floorY);


    for (let pos of platformPositions) {
      const w = pos.width || defaultWidth;
      const platform = this.add.rectangle(pos.x, pos.y, w, platformHeight, 0x333333);
      this.platforms.push(platform);
      this.platformConfigs.push({
        platform: platform,
        width: w,
        platformY: pos.y
      });
    }

    // Create spikes from ASCII art
    for (let pos of spikePositions) {
      const spike = this.add.polygon(pos.x, pos.y, [0, -16, 8, 8, -8, 8], 0xff6600);
      this.spikes.push({ x: pos.x, y: pos.y, size: 16 });
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

      // Player size for collisions
      const playerSize = 32;

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

      // Check collision with spikes
      for (let spike of this.spikes) {
        const spikeSize = spike.size;
        if (
          this.playerX < spike.x + spikeSize / 2 &&
          this.playerX + playerSize > spike.x - spikeSize / 2 &&
          this.playerY < spike.y + spikeSize / 2 &&
          this.playerY + playerSize > spike.y - spikeSize / 2
        ) {
          this.gameOver = true;
        }
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

  parsePlatformASCII(ascii, floorY) {
    const lines = ascii.split('\n').filter(line => line.trim().length > 0);
    const platformPositions = [];
    const spikePositions = [];
    const charWidth = 16; // Width per character in world units
    const rowHeight = 100; // Vertical spacing between rows
    const totalLines = lines.length;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const rowIndex = totalLines - 1 - i;
      let inPlatform = false;
      let platformStart = 0;

      for (let col = 0; col < line.length; col++) {
        const char = line[col];

        if (char === '#') {
          if (!inPlatform) {
            platformStart = col;
            inPlatform = true;
          }
        } else if (char === '^') {
          if (inPlatform) {
            // End of platform before spike
            const platformLength = col - platformStart;
            const platformWidth = platformLength * charWidth;
            const platformX = 200 + platformStart * charWidth + platformWidth / 2;
            const platformY = floorY - 16 - rowIndex * rowHeight;

            platformPositions.push({ x: platformX, y: platformY, width: platformWidth });
            inPlatform = false;
          }
          // Add spike
          const spikeX = 200 + col * charWidth + charWidth / 2;
          const spikeY = floorY - 16 - rowIndex * rowHeight;
          spikePositions.push({ x: spikeX, y: spikeY });
        } else {
          if (inPlatform) {
            // End of platform
            const platformLength = col - platformStart;
            const platformWidth = platformLength * charWidth;
            const platformX = 200 + platformStart * charWidth + platformWidth / 2;
            const platformY = floorY - 16 - rowIndex * rowHeight;

            platformPositions.push({ x: platformX, y: platformY, width: platformWidth });
            inPlatform = false;
          }
        }
      }

      // Handle platform at end of line
      if (inPlatform) {
        const platformLength = line.length - platformStart;
        const platformWidth = platformLength * charWidth;
        const platformX = 200 + platformStart * charWidth + platformWidth / 2;
        const platformY = floorY - 16 - rowIndex * rowHeight;

        platformPositions.push({ x: platformX, y: platformY, width: platformWidth });
      }
    }
    return { platforms: platformPositions, spikes: spikePositions };
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: GeoDashGame,
};

game = new Phaser.Game(config);
