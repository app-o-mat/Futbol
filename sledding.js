/* global Phaser */

var game = undefined;
var gameWidth = 800;
var gameHeight = 600;
var groundHeight = 180;

class SleddingGame extends Phaser.Scene {
  constructor() {
    super('SleddingGame');
    this.playerX = gameWidth / 2;
    this.playerY = 0;
    this.velocityY = 0;
    this.gravity = 1100;
    this.jumpForce = 580;
    this.worldSpeed = 230;
    this.score = 0;
    this.giftsCollected = 0;
    this.objects = [];
    this.spawnTimer = 0;
    this.gameOver = false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#8ed1ff');
    this.groundBaseY = gameHeight - groundHeight / 2;

    this.ground = this.add.rectangle(gameWidth / 2, this.groundBaseY, gameWidth, groundHeight, 0xffffff);
    this.ground.setDepth(1);

    this.horizon = this.add.graphics();
    this.horizon.fillStyle(0xdfeeff, 1);
    this.horizon.fillRect(0, this.groundBaseY - 25, gameWidth, 30);
    this.horizon.setDepth(2);

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '22px',
      fill: '#0a0a0a',
      fontStyle: 'bold',
    });

    this.giftsText = this.add.text(20, 50, 'Gifts: 0', {
      fontSize: '22px',
      fill: '#0a0a0a',
      fontStyle: 'bold',
    });

    this.statusText = this.add.text(gameWidth / 2, 120, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 18, y: 8 },
    }).setOrigin(0.5).setVisible(false);

    this.player = this.add.text(this.playerX, this.groundBaseY - 44, '🛷', {
      fontSize: '46px',
    }).setOrigin(0.5).setDepth(5);

    this.deathDot = this.add.circle(this.playerX, this.player.y, 6, 0xff0000, 1).setVisible(false).setDepth(20);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameOver) {
        this.resetGame();
      }
    });

    this.resetGame();

    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.gameOver) {
          this.score += 1;
          this.scoreText.setText('Score: ' + this.score);
        }
      },
    });
  }

  resetGame() {
    this.gameOver = false;
    this.playerX = gameWidth / 2;
    this.playerY = 0;
    this.velocityY = 0;
    this.score = 0;
    this.giftsCollected = 0;
    this.spawnTimer = 0;

    this.objects.forEach((item) => item.sprite.destroy());
    this.objects = [];

    this.scoreText.setText('Score: 0');
    this.giftsText.setText('Gifts: 0');
    this.statusText.setVisible(false).setText('');
    this.deathDot.setVisible(false);
    this.setPlayerPosition();
  }

  setPlayerPosition() {
    const worldShift = this.playerY * 0.75;
    this.player.setPosition(this.playerX, this.groundBaseY - 44 - this.playerY + worldShift);
    this.deathDot.setPosition(this.playerX, this.player.y + 12);
  }

  getObstacleHitbox(item, screenX, screenY, progress) {
    const sizeByKind = {
      tree: { width: 42, height: 78 },
      snowman: { width: 54, height: 62 },
      rock: { width: 36, height: 36 },
    };

    const size = sizeByKind[item.kind] || { width: 30, height: 30 };
    const scale = 0.7 + progress * 0.9;

    return {
      x: screenX,
      y: screenY,
      halfWidth: size.width * scale * 0.5,
      halfHeight: size.height * scale * 0.5,
    };
  }

  spawnItem() {
    const roll = Math.random();
    let kind = 'tree';
    let emoji = '🌲';

    if (roll < 0.3) {
      kind = 'tree';
      emoji = '🌲';
    } else if (roll < 0.6) {
      kind = 'snowman';
      emoji = '⛄';
    } else if (roll < 0.85) {
      kind = 'rock';
      emoji = '🪨';
    } else {
      kind = 'gift';
      emoji = '🎁';
    }

    const x = Phaser.Math.Between(120, gameWidth - 120);
    const startY = this.groundBaseY - groundHeight / 2 + 10;

    if (kind === 'rock') {
      emoji = '●';
    }

    const sprite = this.add.text(x, startY, emoji, {
      fontSize: kind === 'gift' ? '28px' : kind === 'rock' ? '70px' : '38px',
      fill: kind === 'rock' ? '#000000' : '#000000',
    }).setOrigin(0.5);

    this.objects.push({
      kind,
      x,
      z: 1400,
      sprite,
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    const dt = delta / 1000;

    if (this.cursors.left.isDown) {
      this.playerX -= 260 * dt;
    }
    if (this.cursors.right.isDown) {
      this.playerX += 260 * dt;
    }
    this.playerX = Phaser.Math.Clamp(this.playerX, 80, gameWidth - 80);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (this.playerY <= 0.01) {
        this.velocityY = this.jumpForce;
      }
    }

    this.velocityY -= this.gravity * dt;
    this.playerY += this.velocityY * dt;

    if (this.playerY < 0) {
      this.playerY = 0;
      this.velocityY = 0;
    }

    const worldShift = this.playerY * 0.75;
    this.ground.y = this.groundBaseY + worldShift;
    this.setPlayerPosition();

    this.spawnTimer += dt;
    if (this.spawnTimer > 1.1) {
      this.spawnItem();
      this.spawnTimer = 0;
    }

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const item = this.objects[i];
      item.z -= this.worldSpeed * dt;

      if (item.z <= 0) {
        item.sprite.destroy();
        this.objects.splice(i, 1);
        continue;
      }

      const progress = 1 - (item.z / 1400);
      const startY = this.groundBaseY - groundHeight / 2 + 10;
      const endY = this.groundBaseY + 28;
      const screenX = item.x + (this.playerX - gameWidth / 2) * (0.15 + progress * 0.5);
      const screenY = startY + progress * (endY - startY);
      const scale = 0.45 + progress * 2.5;

      item.sprite.setPosition(screenX, screenY);
      item.sprite.setScale(scale);
      item.sprite.setDepth(4 + progress);

      const dx = Math.abs(screenX - this.playerX);
      const dy = Math.abs(screenY - this.player.y);

      if (item.kind === 'gift') {
        if (dx < 34 && dy < 50) {
          this.giftsCollected += 1;
          this.giftsText.setText('Gifts: ' + this.giftsCollected);
          item.sprite.destroy();
          this.objects.splice(i, 1);
          continue;
        }
      } else {
        const obstacleHitbox = this.getObstacleHitbox(item, screenX, screenY, progress);
        const playerHalfWidth = 25;
        const playerHalfHeight = 20;
        const playerBottom = this.player.y + playerHalfHeight;
        const obstacleBottom = screenY + obstacleHitbox.halfHeight;
        const offWhiteLineY = this.groundBaseY - 25;
        const isTreeOrSnowman = item.kind === 'tree' || item.kind === 'snowman';
        const isThreatAtThisPoint = !isTreeOrSnowman || obstacleBottom >= offWhiteLineY;

        const obstacleHasPassedUs = obstacleBottom > playerBottom + 10;
        const isColliding = !obstacleHasPassedUs &&
          dx < obstacleHitbox.halfWidth + playerHalfWidth &&
          dy < obstacleHitbox.halfHeight + playerHalfHeight;

        if (progress > 0.2 && isThreatAtThisPoint && isColliding) {
          this.gameOver = true;
          this.deathDot.setPosition(screenX, screenY);
          this.deathDot.setVisible(true);
          this.statusText.setText('You hit an obstacle! Press R to restart');
          this.statusText.setVisible(true);
          return;
        }
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: SleddingGame,
};

game = new Phaser.Game(config);
