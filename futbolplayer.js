function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export class Player {
  constructor(name, spriteName, spriteSheet) {
    this.name = name;
    this.spriteName = spriteName;
    this.spriteSheet = spriteSheet;
    this.ball = undefined;
    this.isAuto = false;

    this.gameObject = undefined;
    this.defaultVelocity = 60;
    this.kickVelocity = 300;

    this.isMovingForward = false;
    this.isMovingBackward = false;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.kickSound = undefined;
  }

  isAutomatic(isAuto) {
    this.isAuto = isAuto;
  }

  setBall(ball) {
    this.ball = ball;
  }

  update() {
    if (this.isAuto) {
      this.gameObject.body.velocity.x = 0;

      if (this.gameObject.body.velocity.y == 0) {
        this.gameObject.body.velocity.y = 100;
      } else if (this.gameObject.y < 145) {
        this.gameObject.body.velocity.y = (120 * getRandom(6, 15)) / 10;
      } else if (this.gameObject.y > 230) {
        this.gameObject.body.velocity.y = -((120 * getRandom(6, 15)) / 10);
      }
    }

    if (this.isRotatingLeft) {
      this.gameObject.angle = this.gameObject.angle - 1.2;
    } else if (this.isRotatingRight) {
      this.gameObject.angle = this.gameObject.angle + 1.2;
    }

    if (!this.isAuto) {
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
  }

  load(scene) {
    scene.load.image("player" + this.name, this.spriteName);
    scene.load.spritesheet("playerAnimation" + this.name, this.spriteSheet, {
      frameWidth: 32,
      frameHeight: 32,
    });
    // an important note: the audio file must be in the futbol directory
    scene.load.audio("kick" + this.name, "/assets/futbol/kick.wav");
  }

  addSounds(scene) {
    this.kickSound = scene.sound.add("kick" + this.name);
  }

  setupPhysics(scene, ballGameObject, dribbleFunc) {
    scene.physics.world.enable(this.gameObject);
    this.gameObject.body.setCollideWorldBounds(true);
    this.gameObject.body.setMass(100);
    scene.physics.add.collider(
      this.gameObject,
      ballGameObject,
      dribbleFunc,
      null,
      scene,
    );
  }

  placeSprites(scene, gameWidth, gameHeight) {
    this.gameObject = scene.add.sprite(
      gameWidth / 2 - 50,
      gameHeight / 2,
      "player" + this.name,
    );
    scene.anims.create({
      key: "playerRunning" + this.name,
      frameRate: 4,
      frames: scene.anims.generateFrameNumbers("playerAnimation" + this.name, {
        start: 0,
        end: 3,
      }),
      repeat: -1,
    });
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
    this.gameObject.play("playerRunning" + this.name);
  }

  stopMoving() {
    this.isMovingForward = false;
    this.gameObject.stopOnFrame(
      this.gameObject.anims.currentAnim.getFrameAt(1),
    );
  }

  moveBackwards() {
    this.isMovingBackward = true;
    this.gameObject.play("playerRunning" + this.name);
  }

  stopMovingBackwards() {
    this.isMovingBackward = false;
    var index = (this.gameObject.anims.currentFrame.index + 1) % 4;
    this.gameObject.stopOnFrame(
      this.gameObject.anims.currentAnim.getFrameAt(index),
    );
  }

  distanceFromBall() {
    var a = this.ball.y - this.gameObject.y;
    var b = this.ball.x - this.gameObject.x;
    return Math.sqrt(a * a + b * b);
  }

  facingBall() {
    var yDiff = this.ball.y - this.gameObject.y;
    var xDiff = this.ball.x - this.gameObject.x;

    var ballAngle = (Math.atan2(yDiff, xDiff) / Math.PI) * 180.0;
    ballAngle = (ballAngle + 360) % 360;

    var playerAngle = this.gameObject.angle;
    playerAngle = (playerAngle + 360) % 360;

    return (
      Math.abs(playerAngle - ballAngle) < 10 ||
      Math.abs(playerAngle - ballAngle - 360) < 10
    );
  }

  playerKickBall(howMuch) {
    this.ball.body.velocity.x =
      this.kickVelocity * Math.cos(this.gameObject.rotation) * howMuch;
    this.ball.body.velocity.y =
      this.kickVelocity * Math.sin(this.gameObject.rotation) * howMuch;
    this.kickSound.play();
  }

  isCloseEnoughToBallForAKick() {
    var pixelDistance = this.distanceFromBall();
    return pixelDistance < 34;
  }

  playerKick(player) {
    if (this.facingBall() && this.isCloseEnoughToBallForAKick()) {
      this.playerKickBall(1.9);
    }
  }

  moveBasedOnKeys(keyLeft, keyRight, keyForward, keyBackwards, keyKick) {
    keyLeft.on("down", this.startRotatingLeft, this);
    keyLeft.on("up", this.stopRotatingLeft, this);

    keyRight.on("down", this.startRotatingRight, this);
    keyRight.on("up", this.stopRotatingRight, this);

    keyForward.on("down", this.moveForward, this);
    keyForward.on("up", this.stopMoving, this);

    keyBackwards.on("down", this.moveBackwards, this);
    keyBackwards.on("up", this.stopMovingBackwards, this);

    keyKick.on("down", this.playerKick, this);
  }
}
