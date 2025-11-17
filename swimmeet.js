/* global Phaser */
import { Swimmer } from "./swimmer.js";

var game = undefined;
var gameWidth = 17 * 32;
var gameHeight = 12 * 32;

class SwimMeet extends Phaser.Scene {
  constructor() {
    super();
    this.isGameOver = false;
    this.gameOverText = undefined;

    // Create swimmer player objects with spritesheet
    this.swimmer1 = new Swimmer(
      "swimmer1",
      "",
      "/assets/swimmeet/red-swim-spritesheet.png"
    );
    this.swimmer2 = new Swimmer(
      "swimmer2",
      "",
      "/assets/swimmeet/blue-swim-spritesheet.png"
    );

    this.cursors = undefined;
    this.pool = undefined;
    this.alien = undefined; // Alien sprite to show when one swimmer is ahead
    this.grenade = undefined; // Grenade sprite
    this.grenadeTargetX = 0; // Target X position for grenade
    this.grenadeTargetY = 0; // Target Y position for grenade
    this.isGrenadeTraveling = false; // Track if grenade is traveling
    this.losingSwimmer = undefined;
    this.scoreText = undefined;
    this.score = 10;
  }

  preload() {
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.load.crossOrigin = "anonymous";

    this.loadSprites();
  }

  create() {
    this.placeSprites();
    this.setUpPhysics();
    this.setUpKeyboardControls();
    // No sounds yet - to be added later
  }

  update() {
    if (this.checkForGameOver()) {
      return;
    }

    // Update swimmers
    this.swimmer1.update(gameWidth);
    this.swimmer2.update(gameWidth);

    // Check if one swimmer is ahead by more than 20 pixels
    const distanceDifference = Math.abs(
      this.swimmer1.totalSwum - this.swimmer2.totalSwum
    );

    if (distanceDifference > 20) {
      // Show alien and play animation
      if (!this.alien.visible) {
        this.alien.setVisible(true);
        // mark that we're playing the alien animation forward
        this.alien.playingForward = true;
        this.alien.anims.play("alienAnim", true);
      }
    }

    // Check if grenade is traveling and has reached target
    if (this.isGrenadeTraveling) {
      const dx = this.grenadeTargetX - this.grenade.x;
      const dy = this.grenadeTargetY - this.grenade.y;
      const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

      // If grenade reached target (within 5 pixels)
      if (distanceToTarget < 5) {
        this.isGrenadeTraveling = false;
        this.grenade.body.setVelocity(0, 0); // Stop moving

        // Play explosion animation and sound
        this.grenade.anims.play("grenadeExplode", true);
        this.sound.play("boomSound");

        // Hide grenade after explosion completes
        this.grenade.once("animationcomplete", () => {
          this.grenade.setVisible(false);
          this.losingSwimmer.swimForward(10);

          // Run the alien animation backwards to hide it
          // mark that the animation is now running in reverse so the
          // persistent handler won't re-trigger grenade throwing
          this.alien.playingForward = false;
          this.alien.anims.playReverse("alienAnim", true);
          this.alien.once("animationcomplete", () => {
            this.alien.setVisible(false);
          });
        });
      }
    }

    // Placeholder for game logic
    // this.renderScore();
  }

  // Swim meet loading functions
  loadSprites() {
    this.loadPool();
    this.loadSwimmers();
    this.loadAlien();
    this.loadGrenade();
    this.loadSounds();
  }

  loadSounds() {
    // Load grenade sounds
    this.load.audio("launchSound", "/assets/swimmeet/Launch.wav");
    this.load.audio("boomSound", "/assets/swimmeet/BOOM.wav");
  }

  loadPool() {
    this.load.image("poolbg", "/assets/swimmeet/swim-lanes-background.png");
  }

  loadSwimmers() {
    // Load swimmer sprites
    this.swimmer1.load(this);
    this.swimmer2.load(this);
  }

  loadAlien() {
    // Load alien spritesheet (320x32, 10 frames of 32x32)
    this.load.spritesheet("alien", "/assets/swimmeet/alien.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  loadGrenade() {
    // Load grenade spritesheet (9 frames of 32x32)
    this.load.spritesheet("grenade", "/assets/swimmeet/grenade.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  // Physics setup
  setUpPhysics() {
    // Setup physics for swimmers
    this.swimmer1.setupPhysics(this);
    this.swimmer2.setupPhysics(this);
  }

  // Keyboard controls setup
  setUpKeyboardControls() {
    // Set up arrow key controls for swimmer 1
    const keyLeft = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );
    const keyRight = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );

    // Set up A/D key controls for swimmer 2
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Set up swimmer controls
    this.swimmer1.moveBasedOnKeys(keyLeft, keyRight);
    this.swimmer2.moveBasedOnKeys(keyA, keyD);
  }

  // Sprite placement
  placeSprites() {
    // Place the pool background image
    this.pool = this.add.sprite(gameWidth / 2, gameHeight / 2, "poolbg");

    // Place swimmers
    this.swimmer1.placeSprites(this, gameWidth, gameHeight);
    this.swimmer2.placeSprites(
      this,
      gameWidth,
      gameHeight,
      15,
      gameHeight / 2 + 50
    );

    // Create alien sprite at center x, top third y
    this.alien = this.add.sprite(gameWidth / 2, gameHeight / 3, "alien");

    // Create alien animation (all 10 frames)
    this.anims.create({
      key: "alienAnim",
      frames: this.anims.generateFrameNumbers("alien", { start: 0, end: 9 }),
      frameRate: 10,
      repeat: 0, // Play once
    });

    // Hide alien initially
    this.alien.setVisible(false);

    // Listen for alien animation complete to throw grenade.
    // Use a persistent handler but only trigger when the animation
    // was running forward (we set `playingForward` when starting it).
    this.alien.on("animationcomplete", (animation) => {
      if (
        animation &&
        animation.key === "alienAnim" &&
        this.alien.visible &&
        this.alien.playingForward
      ) {
        this.throwGrenade();
      }
    });

    // Create grenade sprite (hidden initially)
    this.grenade = this.add.sprite(0, 0, "grenade");
    this.grenade.setFrame(0); // Start with grenade (not explosion)
    this.grenade.setVisible(false);

    // Create grenade explosion animation (frames 0-8)
    this.anims.create({
      key: "grenadeExplode",
      frames: this.anims.generateFrameNumbers("grenade", { start: 0, end: 8 }),
      frameRate: 10,
      repeat: 0,
    });

    // Enable physics for grenade
    this.physics.world.enable(this.grenade);
  }

  // Game functions
  throwGrenade() {
    // Determine which swimmer is losing (has less total distance)
    this.losingSwimmer =
      this.swimmer1.totalSwum < this.swimmer2.totalSwum
        ? this.swimmer1
        : this.swimmer2;

    // Position grenade next to alien
    this.grenade.x = this.alien.x + 40; // Next to the alien
    this.grenade.y = this.alien.y;
    this.grenade.setFrame(0); // Show grenade (not explosion)
    this.grenade.setVisible(true);

    // Store target position (where losing swimmer is right now)
    this.grenadeTargetX = this.losingSwimmer.gameObject.x;
    this.grenadeTargetY = this.losingSwimmer.gameObject.y;

    // Calculate direction and velocity (10 pixels per second)
    const dx = this.grenadeTargetX - this.grenade.x;
    const dy = this.grenadeTargetY - this.grenade.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Set velocity to move at 10 pixels per second toward target
    const speed = 100; // 10 pixels per second at 60 fps = 100 pixels per second
    this.grenade.body.setVelocity(
      (dx / distance) * speed,
      (dy / distance) * speed
    );

    // Play launch sound
    this.sound.play("launchSound");

    this.isGrenadeTraveling = true;
  }

  renderGameOver() {
    if (this.gameOverText !== undefined) {
      this.gameOverText.destroy();
    }

    this.gameOverText = this.add.text(
      gameWidth / 2,
      gameHeight / 2,
      `Game Over`,
      {
        fontFamily: "helvetica",
      }
    );
  }

  checkForRestartGame() {
    if (this.cursors && this.cursors.up.isDown) {
      restart(this);
      this.score = 0;
      this.isGameOver = false;
    }
  }

  checkForGameOver() {
    if (this.isGameOver) {
      this.renderGameOver();
      this.checkForRestartGame();
      return true;
    }
    return false;
  }

  renderScore() {
    // If we have text on the screen for the score then remove it
    if (this.scoreText !== undefined) {
      this.scoreText.destroy();
    }

    // Put the score text on the screen
    this.scoreText = this.add.text(gameWidth / 2, 16, `Score: ${this.score}`, {
      fontFamily: "helvetica",
    });
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#4444ff", // Blue background like a pool
  scale: {
    mode: Phaser.Scale.FIT,
    width: gameWidth,
    height: gameHeight,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: SwimMeet,
};

// Initialize the game at a certain size
game = new Phaser.Game(config);

// Function to restart the game from the beginning
var restart = function (scene) {
  scene.scene.restart();
};
