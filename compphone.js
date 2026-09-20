/* global Phaser */

var game = undefined;
var gameWidth = 800;
var gameHeight = 600;
var emojiFontFamily = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

class ComPhone extends Phaser.Scene {
  constructor() {
    super();
    this.score = 0;
    this.lives = 3;
    this.carriedExtinguisher = null;
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#0b2545');
    this.physics.world.setBounds(0, 0, gameWidth, gameHeight);

    // Player - invisible controller; phone emoji follows it
    this.player = this.add.rectangle(100, gameHeight / 2, 24, 24, 0xffffff, 0);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Phone emoji
    this.phone = this.add.text(this.player.x, this.player.y, '📱', {
      fontFamily: emojiFontFamily,
      fontSize: '36px'
    });
    this.phone.setOrigin(0.5);
    this.physics.add.existing(this.phone);
    this.phone.body.setSize(20, 24);
    this.phone.body.setOffset(-10, -12);
    this.phone.setDepth(20);

    // Groups
    this.obstacles = this.physics.add.group();
    this.hazards = this.physics.add.group();
    this.wifis = this.physics.add.group();
    this.extinguishers = this.physics.add.group();

    // Collisions
    this.physics.add.overlap(this.phone, this.obstacles, this.hitObstacle, null, this);
    this.physics.add.overlap(this.phone, this.hazards, this.hitObstacle, null, this);
    this.physics.add.overlap(this.phone, this.wifis, this.collectWifi, null, this);
    this.physics.add.overlap(this.phone, this.extinguishers, this.collectExtinguisher, null, this);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#fff' });
    this.livesText = this.add.text(16, 40, 'Lives: 3', { fontSize: '20px', fill: '#fff' });

    // Spawners
    this.obstacleSpawnDelay = 7000;
    this.obstacleSpawnCount = 0;
    this.obstacleTimer = this.time.addEvent({
      delay: this.obstacleSpawnDelay,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });
    this.hazardSpawnDelay = 10000;
    this.hazardSpawnCount = 0;
    this.hazardTimer = this.time.addEvent({
      delay: this.hazardSpawnDelay,
      callback: this.spawnHazard,
      callbackScope: this,
      loop: true
    });
    this.time.addEvent({ delay: 5000, callback: this.spawnWifi, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 15000, callback: this.spawnExtinguisher, callbackScope: this, loop: true });

    // Simple tutorial text
    this.add.text(gameWidth/2, 20, 'Avoid 💣 🧨 ⚡ — collect 📶 for better WiFi', {
      fontFamily: emojiFontFamily,
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5,0);
  }

  update() {
    const speed = 220;
    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = speed;
    } else {
      this.player.body.velocity.x = 0;
    }

    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = speed;
    } else {
      this.player.body.velocity.y = 0;
    }

    // Phone follows player position
    this.phone.x = this.player.x;
    this.phone.y = this.player.y;

    if (this.carriedExtinguisher) {
      this.carriedExtinguisher.x = this.phone.x;
      this.carriedExtinguisher.y = this.phone.y - 32;
    }

    // Cleanup off-screen items
    this.obstacles.children.each((o) => { if (o.x < -50) o.destroy(); });
    this.hazards.children.each((o) => { if (o.x < -50) o.destroy(); });
    this.wifis.children.each((o) => { if (o.x < -50) o.destroy(); });
    this.extinguishers.children.each((o) => { if (o.x < -50) o.destroy(); });
  }

  spawnObstacle() {
    // Obstacles: standard moving mines (💣)
    this.obstacleSpawnCount += 1;
    if (this.obstacleSpawnCount % 2 === 0) {
      this.obstacleSpawnDelay = Math.max(200, this.obstacleSpawnDelay - 200);
      this.obstacleTimer.delay = this.obstacleSpawnDelay;
    }

    const y = Phaser.Math.Between(50, gameHeight - 50);
    const x = Phaser.Math.Between(40, gameWidth - 40);
    const ob = this.add.text(x, y, '💣', {
      fontFamily: emojiFontFamily,
      fontSize: '32px'
    }).setOrigin(0.5);
    this.physics.add.existing(ob);
    // ensure body size matches emoji and set offset so collisions align
    if (ob.body) {
      ob.body.setSize(40, 40);
      ob.body.setOffset(-20, -20);
      ob.body.setVelocityX(-Phaser.Math.Between(120, 220));
      ob.body.setAllowGravity(false);
    }
    ob.setDepth(5);
    this.obstacles.add(ob);
    console.log('spawnObstacle at', x, y);
  }

  spawnHazard() {
    // Hazard: bomb or lightning (🧨 or ⚡) with random choice
    this.hazardSpawnCount += 1;
    if (this.hazardSpawnCount % 2 === 0) {
      this.hazardSpawnDelay = Math.max(200, this.hazardSpawnDelay - 200);
      this.hazardTimer.delay = this.hazardSpawnDelay;
    }

    const emoji = Phaser.Math.Between(0,1) === 0 ? '🧨' : '⚡';
    const y = Phaser.Math.Between(50, gameHeight - 50);
    const x = Phaser.Math.Between(40, gameWidth - 40);
    const h = this.add.text(x, y, emoji, {
      fontFamily: emojiFontFamily,
      fontSize: '36px'
    }).setOrigin(0.5);
    this.physics.add.existing(h);
    if (h.body) {
      h.body.setSize(44, 44);
      h.body.setOffset(-22, -22);
      h.body.setVelocityX(-Phaser.Math.Between(150, 260));
      h.body.setAllowGravity(false);
    }
    h.setDepth(5);
    this.hazards.add(h);
    console.log('spawnHazard', emoji, x, y);
  }

  spawnWifi() {
    // WiFi collectible
    const y = Phaser.Math.Between(60, gameHeight - 60);
    const x = Phaser.Math.Between(40, gameWidth - 40);
    const w = this.add.text(x, y, '📶', {
      fontFamily: emojiFontFamily,
      fontSize: '36px'
    }).setOrigin(0.5);
    this.physics.add.existing(w);
    if (w.body) {
      w.body.setSize(40, 40);
      w.body.setOffset(-20, -20);
      w.body.setVelocityX(-Phaser.Math.Between(80, 160));
      w.body.setAllowGravity(false);
    }
    w.setDepth(5);
    this.wifis.add(w);
    console.log('spawnWifi at', x, y);
  }

  spawnExtinguisher() {
    if (this.carriedExtinguisher) {
      return;
    }

    const y = Phaser.Math.Between(60, gameHeight - 60);
    const x = Phaser.Math.Between(40, gameWidth - 40);
    const extinguisher = this.add.text(x, y, '🧯', {
      fontFamily: emojiFontFamily,
      fontSize: '36px'
    }).setOrigin(0.5);
    this.physics.add.existing(extinguisher);
    if (extinguisher.body) {
      extinguisher.body.setSize(40, 40);
      extinguisher.body.setOffset(-20, -20);
      extinguisher.body.setVelocityX(-Phaser.Math.Between(80, 160));
      extinguisher.body.setAllowGravity(false);
    }
    extinguisher.setDepth(10);
    this.extinguishers.add(extinguisher);
    console.log('spawnExtinguisher at', x, y);
  }

  hitObstacle(phone, obstacle) {
    obstacle.destroy();

    if (this.carriedExtinguisher) {
      this.carriedExtinguisher.destroy();
      this.carriedExtinguisher = null;
      return;
    }

    this.lives -= 1;
    this.livesText.setText('Lives: ' + this.lives);
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  collectWifi(phone, wifi) {
    wifi.destroy();
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
  }

  collectExtinguisher(phone, extinguisher) {
    if (this.carriedExtinguisher) {
      return;
    }

    this.extinguishers.remove(extinguisher, false, false);
    extinguisher.body.enable = false;
    extinguisher.setDepth(21);
    this.carriedExtinguisher = extinguisher;
  }

  gameOver() {
    this.add.text(gameWidth/2, gameHeight/2, 'GAME OVER', { fontSize: '48px', fill: '#ff4444' }).setOrigin(0.5);
    this.scene.pause();
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0b2545',
  scale: { mode: Phaser.Scale.FIT, width: gameWidth, height: gameHeight },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: ComPhone
};

game = new Phaser.Game(config);
