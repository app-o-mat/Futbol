function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export class Swimmer {
  constructor(name, spriteName, spriteSheet) {
    this.name = name;
    this.spriteName = spriteName;
    this.spriteSheet = spriteSheet;
    this.isAuto = false;

    this.gameObject = undefined;
    this.strokeIndicatorText = undefined; // Text to show which key to press
    this.defaultVelocity = 60;

    this.isMovingForward = false;
    this.isMovingBackward = false;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.shouldStrokeLeft = true;
    this.swimmingDirection = 1; // 1 for right, -1 for left
    this.isAnimating = false; // Track if animation is currently playing
    this.totalSwum = 0; // Track total length swum in pixels
  }

  isAutomatic(isAuto) {
    this.isAuto = isAuto;
  }

  update(gameWidth) {
    // Check if swimmer reached the edge and needs to flip
    if (this.gameObject) {
      if (this.gameObject.x >= gameWidth - 16 && this.swimmingDirection === 1) {
        // Reached right edge, flip to swim left
        this.swimmingDirection = -1;
        this.gameObject.scaleX = -1; // Flip sprite horizontally
      } else if (this.gameObject.x <= 16 && this.swimmingDirection === -1) {
        // Reached left edge, flip to swim right
        this.swimmingDirection = 1;
        this.gameObject.scaleX = 1; // Reset sprite to normal
      }

      // Update stroke indicator text position to stay above swimmer
      if (this.strokeIndicatorText) {
        this.strokeIndicatorText.x = this.gameObject.x;
        this.strokeIndicatorText.y = this.gameObject.y - 25;
      }
    }
  }

  moveBasedOnKeys(keyLeft, keyRight) {
    keyLeft.on("down", this.strokeLeft, this);
    keyRight.on("down", this.strokeRight, this);
  }

  // make a swimForward function that takes a distance as a parameter and moves the swimmer forward by that distance
  swimForward(distance) {
    this.gameObject.x += distance * this.swimmingDirection;
    this.totalSwum += distance;
  }

  strokeLeft() {
    if (this.isAnimating && this.shouldStrokeLeft) {
      this.gameObject.x += -5 * this.swimmingDirection;
      this.totalSwum -= 5;
      return;
    }
    // Only allow stroke if animation is not playing and it's the correct stroke turn
    if (!this.isAnimating && this.shouldStrokeLeft) {
      this.shouldStrokeLeft = !this.shouldStrokeLeft;
      this.gameObject.x += 4 * this.swimmingDirection;
      this.totalSwum += 4; // Always add positive distance
      // Hide the indicator while stroking
      this.hideStrokeIndicator();
      // Play left stroke animation (frames 0, 1, 2, 3)
      if (this.gameObject.anims) {
        this.isAnimating = true;
        this.gameObject.anims.play("swimLeft" + this.name);
      }
    } else if (!this.isAnimating && !this.shouldStrokeLeft) {
      // Wrong key pressed - move back 4 pixels
      this.gameObject.x += -4 * this.swimmingDirection;
      this.totalSwum -= 4;
    }
  }

  strokeRight() {
    if (this.isAnimating && !this.shouldStrokeLeft) {
      this.gameObject.x += -5 * this.swimmingDirection;
      this.totalSwum -= 5;
      return;
    }
    // Only allow stroke if animation is not playing and it's the correct stroke turn
    if (!this.isAnimating && !this.shouldStrokeLeft) {
      this.shouldStrokeLeft = !this.shouldStrokeLeft;
      this.gameObject.x += 4 * this.swimmingDirection;
      this.totalSwum += 4; // Always add positive distance
      // Hide the indicator while stroking
      this.hideStrokeIndicator();
      // Play right stroke animation (frames 4, 5, 6, 0)
      if (this.gameObject.anims) {
        this.isAnimating = true;
        this.gameObject.anims.play("swimRight" + this.name);
      }
    } else if (!this.isAnimating && this.shouldStrokeLeft) {
      // Wrong key pressed - move back 4 pixels
      this.gameObject.x += -4 * this.swimmingDirection;
      this.totalSwum -= 4; // Always add positive distance
    }
  }

  load(scene) {
    // Load the swimmer spritesheet if provided
    if (this.spriteSheet && this.spriteSheet !== "") {
      scene.load.spritesheet("swimmer" + this.name, this.spriteSheet, {
        frameWidth: 32,
        frameHeight: 32,
      });
    } else {
      // Load the swimmer sprite
      scene.load.image("swimmer" + this.name, this.spriteName);
    }
  }

  placeSprites(scene, gameWidth, gameHeight, x = 15, y = gameHeight / 2) {
    // Place swimmer sprite at specified position
    this.gameObject = scene.add.sprite(x, y, "swimmer" + this.name);

    // Create animations if spritesheet is loaded
    if (this.spriteSheet && this.spriteSheet !== "") {
      // Left stroke animation: frames 0, 1, 2, 3
      scene.anims.create({
        key: "swimLeft" + this.name,
        frames: scene.anims.generateFrameNumbers("swimmer" + this.name, {
          frames: [0, 1, 2, 3],
        }),
        frameRate: 10,
        repeat: 0,
      });

      // Right stroke animation: frames 4, 5, 6, 0
      scene.anims.create({
        key: "swimRight" + this.name,
        frames: scene.anims.generateFrameNumbers("swimmer" + this.name, {
          frames: [4, 5, 6, 0],
        }),
        frameRate: 10,
        repeat: 0,
      });

      // Set the default frame (frame 0)
      this.gameObject.setFrame(0);

      // Listen for animation complete event to allow next stroke
      this.gameObject.on("animationcomplete", () => {
        this.isAnimating = false;
        // Show the indicator for which stroke is next
        this.updateStrokeIndicator();
      });
    }

    // Create stroke indicator text above swimmer
    this.strokeIndicatorText = scene.add.text(x, y - 25, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.strokeIndicatorText.setOrigin(0.5, 0.5);

    // Show the initial stroke indicator (L to start)
    this.updateStrokeIndicator();
  }

  updateStrokeIndicator() {
    if (this.strokeIndicatorText) {
      // Show "L" if next stroke is left, "R" if next stroke is right
      const nextStroke = this.shouldStrokeLeft ? "L" : "R";
      this.strokeIndicatorText.setText(nextStroke);
      this.strokeIndicatorText.setVisible(true);
    }
  }

  hideStrokeIndicator() {
    if (this.strokeIndicatorText) {
      this.strokeIndicatorText.setVisible(false);
    }
  }

  setupPhysics(scene) {
    // Enable physics for the swimmer
    scene.physics.world.enable(this.gameObject);
  }
}
