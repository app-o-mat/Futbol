/* global Phaser */

var gameWidth = 800;
var gameHeight = 600;

class DieOnFirstGame extends Phaser.Scene {
  constructor() {
    super();
    this.pipeSpeed = 180;
    this.gravity = 980;
    this.flapStrength = -360;
    this.pipeWidth = 82;
    this.gapHeight = 170;
    this.gameStarted = false;
    this.gameOver = false;
    this.score = 0;
    this.pipePairs = [];
  }

  preload() {
    this.load.image('pipeTile', 'assets/dieonfirst/Dietile.asprite.png');
    this.load.image('deathEarly', 'assets/dieonfirst/reggielarguy.jpg');
    this.load.image('deathMiddle', 'assets/dieonfirst/lickmytoe.jpg');
    this.load.image('deathLate', 'assets/dieonfirst/Donald_Trump_mugshot.jpg');
  }

  create() {
    this.cameras.main.setBackgroundColor('#9ed8f5');

    this.add.rectangle(gameWidth / 2, gameHeight - 18, gameWidth, 36, 0x5c9b45);
    this.add.rectangle(gameWidth / 2, gameHeight - 36, gameWidth, 4, 0xf2d16b);

    this.bird = this.add.text(155, gameHeight / 2, '🐶', {
      fontSize: '48px'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(20, 18, 'Score: 0', {
      fontSize: '28px',
      color: '#17324d',
      fontStyle: 'bold'
    });

    this.messageText = this.add.text(gameWidth / 2, gameHeight / 2 - 105, 'DIE ON FIRST', {
      fontSize: '42px',
      color: '#17324d',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.helpText = this.add.text(gameWidth / 2, gameHeight / 2 - 55, 'Click or press SPACE to flap', {
      fontSize: '22px',
      color: '#17324d',
      backgroundColor: '#ffffffcc',
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    }).setOrigin(0.5);

    this.deathImage = this.add.image(gameWidth / 2, gameHeight / 2 + 20, 'deathEarly')
      .setVisible(false);
    const imageScale = Math.min(280 / this.deathImage.width, 180 / this.deathImage.height);
    this.deathImage.setScale(imageScale);

    this.restartText = this.add.text(gameWidth / 2, gameHeight / 2 + 125, 'Click to try again', {
      fontSize: '24px',
      color: '#17324d',
      backgroundColor: '#ffffffcc',
      padding: { left: 12, right: 12, top: 8, bottom: 8 }
    }).setOrigin(0.5).setVisible(false);

    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard.on('keydown-SPACE', this.flap, this);
  }

  flap() {
    if (this.gameOver) {
      this.resetGame();
      return;
    }

    if (!this.gameStarted) {
      this.gameStarted = true;
      this.messageText.setVisible(false);
      this.helpText.setVisible(false);
      this.spawnPipePair(gameWidth + 40);
    }

    this.birdVelocity = this.flapStrength;
  }

  spawnPipePair(xPosition) {
    const gapCenter = Phaser.Math.Between(150, gameHeight - 190);
    const topHeight = gapCenter - this.gapHeight / 2;
    const bottomY = gapCenter + this.gapHeight / 2;
    const bottomHeight = gameHeight - 36 - bottomY;

    const topPipe = this.add.tileSprite(xPosition, topHeight / 2, this.pipeWidth, topHeight, 'pipeTile');
    const bottomPipe = this.add.tileSprite(xPosition, bottomY + bottomHeight / 2, this.pipeWidth, bottomHeight, 'pipeTile');
    this.pipePairs.push({ topPipe, bottomPipe, scored: false });
  }

  update(time, delta) {
    if (!this.gameStarted || this.gameOver) {
      return;
    }

    const seconds = delta / 1000;
    this.birdVelocity += this.gravity * seconds;
    this.bird.y += this.birdVelocity * seconds;
    this.bird.angle = Phaser.Math.Clamp(this.birdVelocity / 12, -20, 75);

    if (this.pipePairs.length === 0 || this.pipePairs[this.pipePairs.length - 1].topPipe.x < gameWidth - 350) {
      this.spawnPipePair(gameWidth + this.pipeWidth);
    }

    for (const pipePair of this.pipePairs) {
      pipePair.topPipe.x -= this.pipeSpeed * seconds;
      pipePair.bottomPipe.x -= this.pipeSpeed * seconds;

      if (!pipePair.scored && pipePair.topPipe.x + this.pipeWidth / 2 < this.bird.x) {
        pipePair.scored = true;
        this.score++;
        this.scoreText.setText('Score: ' + this.score);
      }

      if (this.rectanglesOverlap(this.bird.getBounds(), pipePair.topPipe.getBounds()) ||
        this.rectanglesOverlap(this.bird.getBounds(), pipePair.bottomPipe.getBounds())) {
        this.endGame();
      }
    }

    this.pipePairs = this.pipePairs.filter((pipePair) => {
      if (pipePair.topPipe.x < -this.pipeWidth) {
        pipePair.topPipe.destroy();
        pipePair.bottomPipe.destroy();
        return false;
      }
      return true;
    });

    if (this.bird.y - 20 < 0 || this.bird.y + 20 > gameHeight - 36) {
      this.endGame();
    }
  }

  rectanglesOverlap(first, second) {
    return first.left < second.right && first.right > second.left &&
      first.top < second.bottom && first.bottom > second.top;
  }

  endGame() {
    this.gameOver = true;
    this.gameStarted = false;
    const deathImageKey = this.score < 10 ? 'deathEarly' :
      this.score < 20 ? 'deathMiddle' : 'deathLate';
    this.deathImage.setTexture(deathImageKey).setVisible(true);
    this.messageText.setText('YOU DIED').setVisible(true);
    this.helpText.setText('Score: ' + this.score).setVisible(true);
    this.restartText.setVisible(true);
  }

  resetGame() {
    for (const pipePair of this.pipePairs) {
      pipePair.topPipe.destroy();
      pipePair.bottomPipe.destroy();
    }

    this.pipePairs = [];
    this.bird.y = gameHeight / 2;
    this.bird.angle = 0;
    this.birdVelocity = 0;
    this.score = 0;
    this.scoreText.setText('Score: 0');
    this.messageText.setText('DIE ON FIRST').setVisible(true);
    this.helpText.setText('Click or press SPACE to flap').setVisible(true);
    this.deathImage.setVisible(false);
    this.restartText.setVisible(false);
    this.gameOver = false;
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: DieOnFirstGame
};

new Phaser.Game(config);