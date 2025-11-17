/* global Phaser */
import { Player } from "./futbolplayer.js";

var game = undefined;
var gameWidth = 17 * 32;
var gameHeight = 12 * 32;

class Futbol extends Phaser.Scene {
  constructor() {
    super();
    this.isGameOver = false;
    this.gameOverText = undefined;

    this.player = new Player(
      "player1",
      "/assets/futbol/Player_A01.png",
      "/assets/futbol/Player_A01_anim.png",
    );
    this.playerKeeper = new Player(
      "player1Keeper",
      "/assets/futbol/Player_A01.png",
      "/assets/futbol/Player_A01_anim.png",
    );
    this.playerKeeper.isAuto = true;

    this.player1Midfield = new Player(
      "player1Mid",
      "/assets/futbol/Player_A01.png",
      "/assets/futbol/Player_A01_anim.png",
    );

    this.defensePlayer = new Player(
      "player2",
      "/assets/futbol/Player_A02.png",
      "/assets/futbol/Player_A02_anim.png",
    );
    this.defensePlayerKeeper = new Player(
      "player2Keeper",
      "/assets/futbol/Player_A02.png",
      "/assets/futbol/Player_A02_anim.png",
    );
    this.defensePlayerKeeper.isAuto = true;

    this.player2Midfield = new Player(
      "player2Mid",
      "/assets/futbol/Player_A02.png",
      "/assets/futbol/Player_A02_anim.png",
    );

    this.cursors = undefined;
    this.ball = undefined;
    this.field = undefined;

    this.scoreText = undefined;
    this.score = 0;
    this.defenderScore = 0;
  }

  preload() {
    // this.load.setBaseURL(window.location.origin);
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.load.crossOrigin = "anonymous";

    this.loadSprites();
  }

  create() {
    this.placeSprites();
    this.placeGoalDetectors();
    this.placeOutOfBoundsDetectors();
    this.setUpPhysics();
    this.addSounds();
  }

  placeOutOfBoundsDetector(x, y, w, h) {
    var oobDetector = this.add.rectangle(x, y, w, h, 0xff0000, 0.01);
    this.physics.world.enable(oobDetector);
    oobDetector.body.immovable = true;
    oobDetector.body.moves = false;
    oobDetector.body.setBounce(1);
    this.physics.add.collider(this.ball, oobDetector);
  }

  placeOutOfBoundsDetectors() {
    this.placeOutOfBoundsDetector(gameWidth / 2, 15, gameWidth, 30);
    this.placeOutOfBoundsDetector(
      gameWidth / 2,
      gameHeight - 15,
      gameWidth,
      30,
    );

    this.placeOutOfBoundsDetector(10, gameHeight / 2, 20, gameHeight);
    this.placeOutOfBoundsDetector(
      gameWidth - 10,
      gameHeight / 2,
      20,
      gameHeight,
    );
  }

  placeGoalDetector(x, inset, goalDetectorFn) {
    var goalDetector = this.add.rectangle(
      x,
      gameHeight / 2,
      10,
      60,
      0xff0000,
      0.001,
    );
    this.physics.world.enable(goalDetector);
    this.physics.add.overlap(
      this.ball,
      goalDetector,
      goalDetectorFn,
      null,
      this,
    );

    var goalPost1 = this.add.rectangle(
      x + inset,
      gameHeight / 2 - 33,
      20,
      2,
      0x0000ff,
      0.001,
    );
    this.physics.world.enable(goalPost1);
    goalPost1.body.immovable = true;
    goalPost1.body.moves = false;
    this.physics.add.collider(this.ball, goalPost1);

    var goalPost2 = this.add.rectangle(
      x + inset,
      gameHeight / 2 + 37,
      20,
      2,
      0x0000ff,
      0.001,
    );
    this.physics.world.enable(goalPost2);
    goalPost2.body.immovable = true;
    goalPost2.body.moves = false;
    this.physics.add.collider(this.ball, goalPost2);
  }

  placeGoalDetectors() {
    this.placeGoalDetector(gameWidth - 10, -3, this.goalDetectedPlayer);
    this.placeGoalDetector(0 + 10, 3, this.goalDetectedDefender);
  }

  resetBall() {
    this.ball.body.velocity.x = 0;
    this.ball.body.velocity.y = 0;
    this.ball.x = gameWidth / 2;
    this.ball.y = gameHeight / 2;
  }

  goalDetectedPlayer() {
    this.score = this.score + 1;
    this.resetBall();
  }

  goalDetectedDefender() {
    this.defenderScore = this.defenderScore + 1;
    this.resetBall();
  }

  oobDetected(ball, detector) {}

  update() {
    if (this.checkForGameOver()) {
      return;
    }

    this.movePlayerBasedOnCursor();
    this.slowBallDown();
    this.renderScore();

    this.player.update();
    this.playerKeeper.update();
    this.player1Midfield.update();

    this.defensePlayer.update();
    this.defensePlayerKeeper.update();
    this.player2Midfield.update();
  }

  // Futbol game loading functions
  loadSprites() {
    this.loadField();
    this.loadSoccerBall();
    this.loadPlayer();
  }

  loadField() {
    this.load.image("field", "/assets/futbol/soccerfield_lines_crop_sm.png");
    this.load.image("fieldtile", "/assets/futbol/soccer_tile.png");
    this.load.image("nettile", "/assets/futbol/goal_tile.png");
  }

  loadSoccerBall() {
    this.load.image("ball", "/assets/futbol/soccer_ball.png");
  }

  loadPlayer() {
    this.player.load(this);
    this.playerKeeper.load(this);
    this.player1Midfield.load(this);
    this.defensePlayer.load(this);
    this.defensePlayerKeeper.load(this);
    this.player2Midfield.load(this);
  }

  addSounds() {
    this.player.addSounds(this);
    this.playerKeeper.addSounds(this);
    this.player1Midfield.addSounds(this);
    this.defensePlayer.addSounds(this);
    this.defensePlayerKeeper.addSounds(this);
    this.player2Midfield.addSounds(this);
  }

  // physics
  setUpPhysics() {
    this.physics.world.enable(this.ball);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.setMass(5);
    this.ball.body.setBounce(0.3);

    this.player.setupPhysics(this, this.ball, this.dribble);
    this.playerKeeper.setupPhysics(this, this.ball, this.dribble);
    this.player1Midfield.setupPhysics(this, this.ball, this.dribble);

    this.defensePlayer.setupPhysics(this, this.ball, this.dribble);
    this.defensePlayerKeeper.setupPhysics(this, this.ball, this.dribble);
    this.player2Midfield.setupPhysics(this, this.ball, this.dribble);
  }

  slowBallDown() {
    this.ball.body.velocity.x *= 0.98;
    this.ball.body.velocity.y *= 0.98;
  }

  // Futbol game piece placement
  placeSprites() {
    // This draws the tiles all over the field
    for (var x = -8; x < 9; x++) {
      for (var y = -6; y < 7; y++) {
        this.add.sprite(
          gameWidth / 2 + 32 * x,
          gameHeight / 2 + 32 * y,
          "fieldtile",
        );
      }
    }

    this.field = this.add.sprite(gameWidth / 2, gameHeight / 2, "field");
    this.ball = this.add.sprite(gameWidth / 2, gameHeight / 2, "ball");
    this.player.setBall(this.ball);
    this.player1Midfield.setBall(this.ball);
    this.defensePlayer.setBall(this.ball);
    this.player2Midfield.setBall(this.ball);

    this.player.placeSprites(this, gameWidth, gameHeight);

    this.playerKeeper.placeSprites(this, gameWidth, gameHeight);
    this.playerKeeper.gameObject.x = 50;

    this.player1Midfield.placeSprites(this, gameWidth, gameHeight);
    this.player1Midfield.gameObject.x = gameWidth / 2 - 120;

    this.defensePlayer.placeSprites(this, gameWidth, gameHeight);
    this.defensePlayer.gameObject.x = gameWidth / 2 + 50;
    this.defensePlayer.gameObject.angle = 180;

    this.defensePlayerKeeper.placeSprites(this, gameWidth, gameHeight);
    this.defensePlayerKeeper.gameObject.x = gameWidth - 50;
    this.defensePlayerKeeper.gameObject.angle = 180;

    this.player2Midfield.placeSprites(this, gameWidth, gameHeight);
    this.player2Midfield.gameObject.x = gameWidth / 2 + 120;
    this.player2Midfield.gameObject.angle = 180;

    // This tiles the net
    this.placeNet(gameWidth);
    this.placeNet(10);
  }

  placeNet(goalx) {
    for (var x = -1; x <= 2; x++) {
      for (var y = -4; y <= 4; y++) {
        this.add.sprite(goalx - 8 + 8 * x, gameHeight / 2 + 8 * y, "nettile");
      }
    }
  }

  // Futbol game functions

  playerTouchBall(player, howMuch) {
    this.ball.body.velocity.x = player.body.velocity.x * howMuch;
    this.ball.body.velocity.y = player.body.velocity.y * howMuch;
  }

  dribble(player) {
    this.playerTouchBall(player, 1.15);
  }

  movePlayerBasedOnCursor() {
    var one = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE,
    );
    var five = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE,
    );
    var three = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE,
    );
    var two = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
    );
    var zero = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
    );
    this.player.moveBasedOnKeys(one, three, five, two, zero);

    var a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    var w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    var d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    var s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    var spaceBar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this.defensePlayer.moveBasedOnKeys(a, d, w, s, spaceBar);

    // Add controls for the new midfield player using J, L, I, K, M keys
    var j = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    var l = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    var i = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    var k = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    var m = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.player1Midfield.moveBasedOnKeys(j, l, i, k, m);

    // Add controls for Player 2 midfield using F, H, T, G, B keys
    var f = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    var h = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    var t = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    var g = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    var b = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.player2Midfield.moveBasedOnKeys(f, h, t, g, b);
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
      },
    );
  }

  checkForRestartGame() {
    if (this.cursors.up.isDown) {
      restart(this);
      this.score = 0;
      this.defenderScore = 0;
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

    // Put the new timer text on the screen
    this.scoreText = this.add.text(
      gameWidth / 2,
      16,
      `${this.defenderScore} - ${this.score}`,
      {
        fontFamily: "helvetica",
      },
    );
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
  scene: Futbol,
};

// Initialize the game at a certain size
game = new Phaser.Game(config);

// Function to restart the game from the beginning
var restart = function (scene) {
  scene.scene.restart();
};
