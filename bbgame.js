/* global Phaser */
import { BBPlayer } from "./bbplayer.js";

var game = undefined;
// original field size was defined in tiles, but court is 500x300
var gameWidth = 500;
var gameHeight = 300;

class BBGame extends Phaser.Scene {
  constructor() {
    super();
    this.player1 = new BBPlayer("player1", 0xff0000); // Red player
    this.player1.spriteSheetKey = "bbplayer-01-anim";
    this.player1.animationKey = "player1Running";
    
    this.player2 = new BBPlayer("player2", 0x0000ff); // Blue player
    this.player2.spriteSheetKey = "bbplayer-02-anim";
    this.player2.animationKey = "player2Running";

    this.basketball = undefined;
    this.leftHoop = undefined;
    this.rightHoop = undefined;

    this.scoreText = undefined;
    this.leftScoreText = undefined;
    this.rightScoreText = undefined;
    this.ballTween = undefined;
    this.player1Score = 0;
    this.player2Score = 0;
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
  }

  loadSprites() {
    this.load.image("basketball", "/assets/basketball/basketball.png");
    this.load.image("hoop", "/assets/basketball/BasketBall hoop.png");
    this.load.image("court", "/assets/basketball/BasketBall court.png");
    this.load.image("scoreboard", "/assets/basketball/scoreboard.png");
    
    this.player1.load(this);
    this.player2.load(this);
  }

  drawMidCourtLine() {
    // vertical center line across the court
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff);
    graphics.beginPath();
    graphics.moveTo(gameWidth/2, 0);
    graphics.lineTo(gameWidth/2, gameHeight);
    graphics.strokePath();
  }

  drawThreePointArc(isLeft) {
    // draw half-ellipse as a three-point arc
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff);
   
    const centerY = gameHeight / 2;
    const ellipseHeight = gameHeight/2 - 20;
    const ellipseWidth = 190;
    const centerX = isLeft ? 0 : gameWidth;
    const tStart = isLeft ? -Math.PI/2 : Math.PI/2;
    const tEnd = isLeft ? Math.PI/2 : 3*Math.PI/2;
    // manually construct half-ellipse path
    graphics.beginPath();
    let first = true;
    for (let t = tStart; t <= tEnd; t += 0.01) {
      const x = centerX + ellipseWidth * Math.cos(t);
      const y = centerY + ellipseHeight * Math.sin(t);
      if (first) {
        graphics.moveTo(x, y);
        first = false;
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.strokePath();
  }

  drawFoulBox(isLeft) {
    // draw the rectangular "foul box" (the key) on either half of the court
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff);

    const boxWidth = 110;
    const boxHeight = 110;
    const y = (gameHeight - boxHeight) / 2;
    const radius = boxWidth / 2;

    if (isLeft) {
      // left side box flush with left edge
      graphics.strokeRect(0, y, boxWidth, boxHeight);
      // semi-circle opening toward right
      const centerX = boxWidth;
      const centerY = gameHeight / 2;
      graphics.beginPath();
      let first = true;
      for (let t = -Math.PI / 2; t <= Math.PI / 2; t += 0.01) {
        const x = centerX + radius * Math.cos(t);
        const yPos = centerY + radius * Math.sin(t);
        if (first) {
          graphics.moveTo(x, yPos);
          first = false;
        } else {
          graphics.lineTo(x, yPos);
        }
      }
      graphics.strokePath();
    } else {
      // right side box flush with right edge
      graphics.strokeRect(gameWidth - boxWidth, y, boxWidth, boxHeight);
      // semi-circle opening toward left
      const centerX = gameWidth - boxWidth;
      const centerY = gameHeight / 2;
      graphics.beginPath();
      let first = true;
      for (let t = Math.PI / 2; t <= 3 * Math.PI / 2; t += 0.01) {
        const x = centerX + radius * Math.cos(t);
        const yPos = centerY + radius * Math.sin(t);
        if (first) {
          graphics.moveTo(x, yPos);
          first = false;
        } else {
          graphics.lineTo(x, yPos);
        }
      }
      graphics.strokePath();
    }
  }

  placeSprites() {
    // Add court background first (centered)
    this.courtSprite = this.add.image(gameWidth / 2, gameHeight / 2, "court");
    this.courtSprite.setOrigin(0.5, 0.5);

    this.scoreboard = this.add.sprite(gameWidth / 2, 32, "scoreboard");
    this.scoreboard.setScale(2);

    // court markings
    this.drawMidCourtLine();
    this.drawThreePointArc(true);
    this.drawThreePointArc(false);
    this.drawFoulBox(true);
    this.drawFoulBox(false);

    this.basketball = this.add.sprite(gameWidth / 2, gameHeight / 2, "basketball");
    this.basketball.carriedBy = null;
    this.basketball.shotBy = null;
    this.basketball.setScale(1);

    this.player1.placeSprite(this, gameWidth / 4, gameHeight / 2);
    this.player1.setBall(this.basketball);

    this.player2.placeSprite(this, (3 * gameWidth) / 4, gameHeight / 2);
    this.player2.gameObject.angle = 180;
    this.player2.setBall(this.basketball);

    this.leftHoop = this.add.rectangle(16, gameHeight / 2, 32, 96, 0x808080);
    this.rightHoop = this.add.rectangle(gameWidth - 16, gameHeight / 2, 32, 96, 0x808080);

    // Place hoop image centered on the left gray hoop rectangle
    this.leftHoopSprite = this.add.image(this.leftHoop.x, this.leftHoop.y, "hoop");
    this.leftHoopSprite.setOrigin(0.5, 0.5);

    // Place and rotate hoop image centered on the right gray hoop rectangle
    this.rightHoopSprite = this.add.image(this.rightHoop.x, this.rightHoop.y, "hoop");
    this.rightHoopSprite.setOrigin(0.5, 0.5);
    this.rightHoopSprite.setAngle(180);
  }

  setUpPhysics() {
    this.physics.world.enable(this.basketball);
    this.basketball.body.setCollideWorldBounds(true);
    this.basketball.body.setMass(5);
    this.basketball.body.setBounce(0.1);
    this.basketball.body.setDrag(0.02);

    this.player1.setupPhysics(this);
    this.player2.setupPhysics(this);
    
    // Setup animations for players
    this.player1.setupAnimations(this);
    this.player2.setupAnimations(this);

    this.physics.add.collider(this.player1.gameObject, this.basketball, this.playerTouchBall, null, this);
    this.physics.add.collider(this.player2.gameObject, this.basketball, this.playerTouchBall, null, this);

    // Enable physics on hoop sprites and use them for goal detection
    if (this.leftHoopSprite) {
      this.physics.world.enable(this.leftHoopSprite);
      this.leftHoopSprite.body.immovable = true;
      this.leftHoopSprite.body.moves = false;
      this.physics.add.overlap(this.basketball, this.leftHoopSprite, this.goalDetectedPlayer2, null, this);
    }

    if (this.rightHoopSprite) {
      this.physics.world.enable(this.rightHoopSprite);
      this.rightHoopSprite.body.immovable = true;
      this.rightHoopSprite.body.moves = false;
      this.physics.add.overlap(this.basketball, this.rightHoopSprite, this.goalDetectedPlayer1, null, this);
    }
  }

  // determine whether a shot taken from (x,y) would be outside the three-point arc
  isShotOutsideThree(x, y, isLeft) {
    if (x === undefined || y === undefined) {
      return false;
    }
    const centerX = isLeft ? 0 : gameWidth;
    const centerY = gameHeight / 2;
    const ellipseWidth = 190;
    const ellipseHeight = gameHeight / 2 - 20;
    // normalized coordinates relative to ellipse center
    const dx = x - centerX;
    const dy = y - centerY;
    const value = (dx * dx) / (ellipseWidth * ellipseWidth) + (dy * dy) / (ellipseHeight * ellipseHeight);
    // outside if value > 1
    return value > 1;
  }

  goalDetectedPlayer1() {
    // player1 scored on right hoop
    console.log("Goal detected! Player 1 (Red) scored!");
    let points = 2;
    if (this.basketball && this.isShotOutsideThree(this.basketball.lastShotX, this.basketball.lastShotY, false)) {
      points = 3;
    }
    this.player1Score += points;
    this.resetBall();
  }

  goalDetectedPlayer2() {
    // player2 scored on left hoop
    console.log("Goal detected! Player 2 (Blue) scored!");
    let points = 2;
    if (this.basketball && this.isShotOutsideThree(this.basketball.lastShotX, this.basketball.lastShotY, true)) {
      points = 3;
    }
    this.player2Score += points;
    this.resetBall();
  }

  resetBall() {
    // If Arcade Body.reset is available use it to immediately set position and zero velocity
    if (this.basketball && this.basketball.body && typeof this.basketball.body.reset === 'function') {
      this.basketball.body.reset(gameWidth / 2, gameHeight / 2);
    } else {
      if (this.basketball) {
        this.basketball.x = gameWidth / 2;
        this.basketball.y = gameHeight / 2;
        if (this.basketball.body) {
          this.basketball.body.velocity.x = 0;
          this.basketball.body.velocity.y = 0;
        }
      }
    }
    if (this.basketball) {
      this.basketball.carriedBy = null;
      this.basketball.shotBy = null;
      this.basketball.lastShotX = undefined;
      this.basketball.lastShotY = undefined;
      this.basketball.setScale(1);
    }

    // Reset players to their starting positions and stop movement
    if (this.player1 && this.player1.gameObject) {
      this.player1.gameObject.x = gameWidth / 4;
      this.player1.gameObject.y = gameHeight / 2;
      if (this.player1.gameObject.body) {
        this.player1.gameObject.body.velocity.x = 0;
        this.player1.gameObject.body.velocity.y = 0;
      }
      this.player1.gameObject.angle = 0;
      if (this.player1.gameObject.anims.isPlaying) {
        this.player1.gameObject.stop();
      }
      this.player1.gameObject.setFrame(1);
    }

    if (this.player2 && this.player2.gameObject) {
      this.player2.gameObject.x = (3 * gameWidth) / 4;
      this.player2.gameObject.y = gameHeight / 2;
      if (this.player2.gameObject.body) {
        this.player2.gameObject.body.velocity.x = 0;
        this.player2.gameObject.body.velocity.y = 0;
      }
      this.player2.gameObject.angle = 180;
      if (this.player2.gameObject.anims.isPlaying) {
        this.player2.gameObject.stop();
      }
      this.player2.gameObject.setFrame(1);
    }
  }

  renderScore() {
    if (this.leftScoreText !== undefined) {
      this.leftScoreText.destroy();
    }
    if (this.rightScoreText !== undefined) {
      this.rightScoreText.destroy();
    }

    this.leftScoreText = this.add.text(
      gameWidth / 2 - 25,
      32,
      `${this.player1Score}`,
      {
        fontFamily: "helvetica",
        fontSize: "13px",
        color: "#ffffff",
      },
    );
    this.leftScoreText.setOrigin(0.5, 0.5);

    this.rightScoreText = this.add.text(
      gameWidth / 2 + 25,
      32,
      `${this.player2Score}`,
      {
        fontFamily: "helvetica",
        fontSize: "13px",
        color: "#ffffff",
      },
    );
    this.rightScoreText.setOrigin(0.5, 0.5);
  }

  playerTouchBall(player, ball) {
    ball.carriedBy = player;
  }

  update() {
    this.movePlayersBasedOnKeys();
    this.renderScore();
    
    // Update ball position if being carried
    if (this.basketball.carriedBy !== null) {
      const offsetDistance = 25;
      this.basketball.x = this.basketball.carriedBy.x + offsetDistance * Math.cos(this.basketball.carriedBy.rotation);
      this.basketball.y = this.basketball.carriedBy.y + offsetDistance * Math.sin(this.basketball.carriedBy.rotation);
      this.basketball.body.velocity.x = this.basketball.carriedBy.body.velocity.x;
      this.basketball.body.velocity.y = this.basketball.carriedBy.body.velocity.y;

      // Start dribbling animation if not already running
      if (this.ballTween === undefined) {
        this.ballTween = this.tweens.add({
          targets: this.basketball,
          scale: 0.9,
          duration: 200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      // Stop dribbling animation if running
      if (this.ballTween !== undefined) {
        this.ballTween.stop();
        this.ballTween = undefined;
        this.basketball.setScale(1);
      }
    }
    
    this.player1.update();
    this.player2.update();
  }

  movePlayersBasedOnKeys() {
    // Left player controls (WASD)
    var a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    var d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    var w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    var s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.player1.moveBasedOnKeys(a, d, w, s);
    // shoot controls for player1 (space key)
    var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on("down", this.player1.shootBall, this.player1);

    // Right player controls (Arrow Keys)
    var left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    var right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    var up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    var down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.player2.moveBasedOnKeys(left, right, up, down);

    // Shoot controls for player2 (0 key)
    var zeroKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
    zeroKey.on("down", this.player2.shootBall, this.player2);
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#20aa20",
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
  scene: BBGame,
};

// Initialize the game at a certain size
game = new Phaser.Game(config);
