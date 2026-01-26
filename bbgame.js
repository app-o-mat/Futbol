/* global Phaser */
import { BBPlayer } from "./bbplayer.js";

var game = undefined;
var gameWidth = 17 * 32;
var gameHeight = 12 * 32;

class BBGame extends Phaser.Scene {
  constructor() {
    super();
    this.player1 = new BBPlayer("player1", 0xff0000); // Red player
    this.player2 = new BBPlayer("player2", 0x0000ff); // Blue player

    this.basketball = undefined;
    this.leftHoop = undefined;
    this.rightHoop = undefined;

    this.scoreText = undefined;
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
  }

  placeSprites() {
    this.basketball = this.add.sprite(gameWidth / 2, gameHeight / 2, "basketball");
    this.basketball.carriedBy = null;
    this.basketball.shotBy = null;

    this.player1.placeSprite(this, gameWidth / 4, gameHeight / 2);
    this.player1.setBall(this.basketball);

    this.player2.placeSprite(this, (3 * gameWidth) / 4, gameHeight / 2);
    this.player2.setBall(this.basketball);

    this.leftHoop = this.add.rectangle(16, gameHeight / 2, 32, 96, 0x808080);
    this.rightHoop = this.add.rectangle(gameWidth - 16, gameHeight / 2, 32, 96, 0x808080);
  }

  setUpPhysics() {
    this.physics.world.enable(this.basketball);
    this.basketball.body.setCollideWorldBounds(true);
    this.basketball.body.setMass(5);
    this.basketball.body.setBounce(0.3);

    this.player1.setupPhysics(this);
    this.player2.setupPhysics(this);

    this.physics.add.collider(this.player1.gameObject, this.basketball, this.playerTouchBall, null, this);
    this.physics.add.collider(this.player2.gameObject, this.basketball, this.playerTouchBall, null, this);

    this.physics.add.overlap(this.basketball, this.leftHoop, this.goalDetectedPlayer2, null, this);
    this.physics.add.overlap(this.basketball, this.rightHoop, this.goalDetectedPlayer1, null, this);
  }

  goalDetectedPlayer1() {
    if (this.basketball.shotBy === "player2") {
      this.player2Score = this.player2Score + 2;
    } else {
      this.player1Score = this.player1Score + 1;
    }
    this.resetBall();
  }

  goalDetectedPlayer2() {
    if (this.basketball.shotBy === "player1") {
      this.player1Score = this.player1Score + 2;
    } else {
      this.player2Score = this.player2Score + 1;
    }
    this.resetBall();
  }

  resetBall() {
    this.basketball.body.velocity.x = 0;
    this.basketball.body.velocity.y = 0;
    this.basketball.x = gameWidth / 2;
    this.basketball.y = gameHeight / 2;
    this.basketball.carriedBy = null;
    this.basketball.shotBy = null;
  }

  renderScore() {
    if (this.scoreText !== undefined) {
      this.scoreText.destroy();
    }

    this.scoreText = this.add.text(
      gameWidth / 2,
      16,
      `${this.player1Score} - ${this.player2Score}`,
      {
        fontFamily: "helvetica",
        fontSize: "24px",
      },
    );
    this.scoreText.setOrigin(0.5, 0);
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
