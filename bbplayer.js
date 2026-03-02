export class BBPlayer {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.ball = undefined;

    this.gameObject = undefined;
    this.defaultVelocity = 60;
    this.shootVelocity = 400;

    this.isMovingForward = false;
    this.isMovingBackward = false;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    
    this.spriteSheetKey = undefined;
    this.animationKey = undefined;
  }

  setBall(ball) {
    this.ball = ball;
  }

  load(scene) {
    scene.load.spritesheet(this.spriteSheetKey, `/assets/basketball/${this.spriteSheetKey}.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  setupAnimations(scene) {
    if (this.animationKey && this.spriteSheetKey) {
      scene.anims.create({
        key: this.animationKey,
        frames: scene.anims.generateFrameNumbers(this.spriteSheetKey, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  update() {
    if (this.isRotatingLeft) {
      this.gameObject.angle = this.gameObject.angle - 1.2;
    } else if (this.isRotatingRight) {
      this.gameObject.angle = this.gameObject.angle + 1.2;
    }

    if (this.isMovingForward || this.isMovingBackward) {
      // Play running animation
      if (this.animationKey && !this.gameObject.anims.isPlaying) {
        this.gameObject.play(this.animationKey, true);
      }
    } else {
      // Stop animation and show frame 1 (second frame)
      if (this.gameObject.anims.isPlaying) {
        this.gameObject.stop();
      }
      this.gameObject.setFrame(1);
    }

    if (this.isMovingForward) {
      this.gameObject.body.velocity.x =
        this.defaultVelocity * Math.cos(this.gameObject.rotation);
      this.gameObject.body.velocity.y =
        this.defaultVelocity * Math.sin(this.gameObject.rotation);
    } else if (this.isMovingBackward) {
      this.gameObject.body.velocity.x =
        -this.defaultVelocity * Math.cos(this.gameObject.rotation);
      this.gameObject.body.velocity.y =
        -this.defaultVelocity * Math.sin(this.gameObject.rotation);
    } else {
      this.gameObject.body.velocity.x = 0;
      this.gameObject.body.velocity.y = 0;
    }
  }

  setupPhysics(scene) {
    scene.physics.world.enable(this.gameObject);
    this.gameObject.body.setCollideWorldBounds(true);
    this.gameObject.body.setMass(100);
  }

  placeSprite(scene, x, y) {
    this.gameObject = scene.add.sprite(x, y, this.spriteSheetKey);
    this.gameObject.setFrame(1);
  }

  startRotatingLeft() {
    this.isRotatingLeft = true;
  }

  stopRotatingLeft() {
    this.isRotatingLeft = false;
  }

  startRotatingRight() {
    this.isRotatingRight = true;
  }

  stopRotatingRight() {
    this.isRotatingRight = false;
  }

  moveForward() {
    this.isMovingForward = true;
  }

  stopMoving() {
    this.isMovingForward = false;
  }

  moveBackwards() {
    this.isMovingBackward = true;
  }

  stopMovingBackwards() {
    this.isMovingBackward = false;
  }

  moveBasedOnKeys(keyLeft, keyRight, keyForward, keyBackwards) {
    keyLeft.on("down", this.startRotatingLeft, this);
    keyLeft.on("up", this.stopRotatingLeft, this);

    keyRight.on("down", this.startRotatingRight, this);
    keyRight.on("up", this.stopRotatingRight, this);

    keyForward.on("down", this.moveForward, this);
    keyForward.on("up", this.stopMoving, this);

    keyBackwards.on("down", this.moveBackwards, this);
    keyBackwards.on("up", this.stopMovingBackwards, this);
  }

  shootBall() {
    if (this.ball !== undefined && this.ball.carriedBy === this.gameObject) {
      this.ball.body.velocity.x = this.shootVelocity * Math.cos(this.gameObject.rotation);
      this.ball.body.velocity.y = this.shootVelocity * Math.sin(this.gameObject.rotation);
      this.ball.carriedBy = null;
      this.ball.shotBy = this.name;
    }
  }
}
