/* global Phaser */

var game = undefined;
var gameWidth = 800;
var gameHeight = 600;

class BlatmanGame extends Phaser.Scene {
  constructor() {
    super();
    this.currentRoom = 0;
    this.collected = [];
    this.baconItem = null;
    this.lettuceItem = null;
    this.tomatoItem = null;
    this.avocadoItem = null;
    this.breadItem = null;
  }

  preload() {
    // No assets to load for now
  }

  create() {
    // Set background to black
    this.cameras.main.setBackgroundColor('#000000');

    // Enable physics
    this.physics.world.setBounds(0, 0, gameWidth, gameHeight);

    // Create player
    this.player = this.add.rectangle(400, 500, 20, 20, 0x00008B);
    this.physics.add.existing(this.player);
    this.player.body.collideWorldBounds = true;

    // Create groups
    this.walls = this.add.group();
    this.items = this.add.group();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.overlap(this.player, this.items, this.collectItem, null, this);

    // Set initial room
    this.setRoom(0);
  }

  update() {
    // Movement
    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -160;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = 160;
    } else {
      this.player.body.velocity.x = 0;
    }

    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -160;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = 160;
    } else {
      this.player.body.velocity.y = 0;
    }

    // Room transitions
    if (this.currentRoom === 0 && this.player.y > 570) {
      this.setRoom(1);
      this.player.setPosition(400, 50);
    } else if (this.currentRoom === 1) {
      if (this.player.y < 30) {
        this.setRoom(0);
        this.player.setPosition(400, 550);
      } else if (this.player.x < 20) {
        this.setRoom(2);
        this.player.setPosition(780, 300);
      } else if (this.player.x > 780) {
        this.setRoom(3);
        this.player.setPosition(20, 300);
      }
    } else if (this.currentRoom === 2) {
      if (this.player.x > 780) {
        this.setRoom(1);
        this.player.setPosition(20, 300);
      } else if (this.player.y < 30) {
        this.setRoom(4);
        this.player.setPosition(400, 550);
      }
    } else if (this.currentRoom === 3) {
      if (this.player.x < 20) {
        this.setRoom(1);
        this.player.setPosition(780, 300);
      } else if (this.player.x > 780) {
        this.setRoom(5);
        this.player.setPosition(20, 300);
      }
    } else if (this.currentRoom === 4) {
      if (this.player.y > 570) {
        this.setRoom(2);
        this.player.setPosition(400, 50);
      } else if (this.player.x > 780) {
        this.setRoom(5);
        this.player.setPosition(20, 300);
      }
    } else if (this.currentRoom === 5) {
      if (this.player.x < 20) {
        this.setRoom(3);
        this.player.setPosition(780, 300);
      } else if (this.player.y > 570) {
        this.setRoom(4);
        this.player.setPosition(400, 50);
      }
    }

    // Update bacon position if collected
    if (this.baconItem && this.baconItem.carriedBy === this.player) {
      this.baconItem.x = this.player.x - 20;
      this.baconItem.y = this.player.y - 20;
      if (this.baconItem.body) {
        this.baconItem.body.velocity.x = this.player.body.velocity.x;
        this.baconItem.body.velocity.y = this.player.body.velocity.y;
      }
    }

    // Update lettuce position if collected
    if (this.lettuceItem && this.lettuceItem.carriedBy === this.player) {
      this.lettuceItem.x = this.player.x - 20;
      this.lettuceItem.y = this.player.y + 20;
      if (this.lettuceItem.body) {
        this.lettuceItem.body.velocity.x = this.player.body.velocity.x;
        this.lettuceItem.body.velocity.y = this.player.body.velocity.y;
      }
    }

    // Update tomato position if collected
    if (this.tomatoItem && this.tomatoItem.carriedBy === this.player) {
      this.tomatoItem.x = this.player.x + 20;
      this.tomatoItem.y = this.player.y - 20;
      if (this.tomatoItem.body) {
        this.tomatoItem.body.velocity.x = this.player.body.velocity.x;
        this.tomatoItem.body.velocity.y = this.player.body.velocity.y;
      }
    }

    // Update avocado position if collected
    if (this.avocadoItem && this.avocadoItem.carriedBy === this.player) {
      this.avocadoItem.x = this.player.x + 20;
      this.avocadoItem.y = this.player.y + 20;
      if (this.avocadoItem.body) {
        this.avocadoItem.body.velocity.x = this.player.body.velocity.x;
        this.avocadoItem.body.velocity.y = this.player.body.velocity.y;
      }
    }

    // Update bread position if collected
    if (this.breadItem && this.breadItem.carriedBy === this.player) {
      this.breadItem.x = this.player.x + 20;
      this.breadItem.y = this.player.y;
      if (this.breadItem.body) {
        this.breadItem.body.velocity.x = this.player.body.velocity.x;
        this.breadItem.body.velocity.y = this.player.body.velocity.y;
      }
    }
  }

  setRoom(index) {
    this.currentRoom = index;
    this.walls.clear(true, true);
    this.items.clear(true, true);

    if (index === 0) {
      // Main screen: walls with 256px opening at bottom center
      let wallTop = this.add.rectangle(400, 10, 800, 20, 0x666666);
      this.physics.add.existing(wallTop);
      wallTop.body.immovable = true;
      this.walls.add(wallTop);

      let wallLeft = this.add.rectangle(10, 300, 20, 600, 0x666666);
      this.physics.add.existing(wallLeft);
      wallLeft.body.immovable = true;
      this.walls.add(wallLeft);

      let wallRight = this.add.rectangle(790, 300, 20, 600, 0x666666);
      this.physics.add.existing(wallRight);
      wallRight.body.immovable = true;
      this.walls.add(wallRight);

      // Bottom walls with 256px opening in center
      let wallBottomLeft = this.add.rectangle(136, 590, 272, 20, 0x666666);
      this.physics.add.existing(wallBottomLeft);
      wallBottomLeft.body.immovable = true;
      this.walls.add(wallBottomLeft);

      let wallBottomRight = this.add.rectangle(664, 590, 272, 20, 0x666666);
      this.physics.add.existing(wallBottomRight);
      wallBottomRight.body.immovable = true;
      this.walls.add(wallBottomRight);
    } else if (index === 1) {
      // Room 1: green walls with 256px openings on top, left, right
      // Top walls with opening
      let wallTopLeft = this.add.rectangle(136, 10, 272, 20, 0x00ff00);
      this.physics.add.existing(wallTopLeft);
      wallTopLeft.body.immovable = true;
      this.walls.add(wallTopLeft);

      let wallTopRight = this.add.rectangle(664, 10, 272, 20, 0x00ff00);
      this.physics.add.existing(wallTopRight);
      wallTopRight.body.immovable = true;
      this.walls.add(wallTopRight);

      // Bottom solid
      let wallBottom = this.add.rectangle(400, 590, 800, 20, 0x00ff00);
      this.physics.add.existing(wallBottom);
      wallBottom.body.immovable = true;
      this.walls.add(wallBottom);

      // Left walls with opening
      let wallLeftTop = this.add.rectangle(10, 86, 20, 172, 0x00ff00);
      this.physics.add.existing(wallLeftTop);
      wallLeftTop.body.immovable = true;
      this.walls.add(wallLeftTop);

      let wallLeftBottom = this.add.rectangle(10, 514, 20, 172, 0x00ff00);
      this.physics.add.existing(wallLeftBottom);
      wallLeftBottom.body.immovable = true;
      this.walls.add(wallLeftBottom);

      // Right walls with opening
      let wallRightTop = this.add.rectangle(790, 86, 20, 172, 0x00ff00);
      this.physics.add.existing(wallRightTop);
      wallRightTop.body.immovable = true;
      this.walls.add(wallRightTop);

      let wallRightBottom = this.add.rectangle(790, 514, 20, 172, 0x00ff00);
      this.physics.add.existing(wallRightBottom);
      wallRightBottom.body.immovable = true;
      this.walls.add(wallRightBottom);

      // Item - Bacon
      let item = this.add.text(400, 300, '🥓', { fontSize: '24px', color: '#ffffff' });
      item.carriedBy = null;
      this.physics.add.existing(item);
      item.body.setSize(40, 40);
      item.body.setOffset(-20, -20);
      this.physics.add.collider(this.player, item, this.collectItem, null, this);
      this.baconItem = item;
    } else if (index === 2) {
      // Room 2: blue walls with openings on right (back to 1) and top (to 4)
      // Top opening
      let wallTopLeft = this.add.rectangle(136, 10, 272, 20, 0x0000ff);
      this.physics.add.existing(wallTopLeft);
      wallTopLeft.body.immovable = true;
      this.walls.add(wallTopLeft);

      let wallTopRight = this.add.rectangle(664, 10, 272, 20, 0x0000ff);
      this.physics.add.existing(wallTopRight);
      wallTopRight.body.immovable = true;
      this.walls.add(wallTopRight);

      // Bottom solid
      let wallBottom = this.add.rectangle(400, 590, 800, 20, 0x0000ff);
      this.physics.add.existing(wallBottom);
      wallBottom.body.immovable = true;
      this.walls.add(wallBottom);

      // Left solid
      let wallLeft = this.add.rectangle(10, 300, 20, 600, 0x0000ff);
      this.physics.add.existing(wallLeft);
      wallLeft.body.immovable = true;
      this.walls.add(wallLeft);

      // Right opening
      let wallRightTop = this.add.rectangle(790, 86, 20, 172, 0x0000ff);
      this.physics.add.existing(wallRightTop);
      wallRightTop.body.immovable = true;
      this.walls.add(wallRightTop);

      let wallRightBottom = this.add.rectangle(790, 514, 20, 172, 0x0000ff);
      this.physics.add.existing(wallRightBottom);
      wallRightBottom.body.immovable = true;
      this.walls.add(wallRightBottom);

      // Item
      let item = this.add.text(400, 300, '🥬', { fontSize: '24px', color: '#ffffff' });
      item.carriedBy = null;
      this.physics.add.existing(item);
      item.body.setSize(30, 30);
      item.body.setOffset(-15, -15);
      this.physics.add.collider(this.player, item, this.collectItem, null, this);
      this.lettuceItem = item;
    } else if (index === 3) {
      // Room 3: purple walls with openings on left (back to 1) and right (to 5)
      // Top solid
      let wallTop = this.add.rectangle(400, 10, 800, 20, 0x800080);
      this.physics.add.existing(wallTop);
      wallTop.body.immovable = true;
      this.walls.add(wallTop);

      // Bottom solid
      let wallBottom = this.add.rectangle(400, 590, 800, 20, 0x800080);
      this.physics.add.existing(wallBottom);
      wallBottom.body.immovable = true;
      this.walls.add(wallBottom);

      // Left opening
      let wallLeftTop = this.add.rectangle(10, 86, 20, 172, 0x800080);
      this.physics.add.existing(wallLeftTop);
      wallLeftTop.body.immovable = true;
      this.walls.add(wallLeftTop);

      let wallLeftBottom = this.add.rectangle(10, 514, 20, 172, 0x800080);
      this.physics.add.existing(wallLeftBottom);
      wallLeftBottom.body.immovable = true;
      this.walls.add(wallLeftBottom);

      // Right opening
      let wallRightTop = this.add.rectangle(790, 86, 20, 172, 0x800080);
      this.physics.add.existing(wallRightTop);
      wallRightTop.body.immovable = true;
      this.walls.add(wallRightTop);

      let wallRightBottom = this.add.rectangle(790, 514, 20, 172, 0x800080);
      this.physics.add.existing(wallRightBottom);
      wallRightBottom.body.immovable = true;
      this.walls.add(wallRightBottom);

      // Item - Avocado
      let item = this.add.text(400, 300, '🥑', { fontSize: '24px', color: '#ffffff' });
      item.carriedBy = null;
      this.physics.add.existing(item);
      item.body.setSize(30, 30);
      item.body.setOffset(-15, -15);
      this.physics.add.collider(this.player, item, this.collectItem, null, this);
      this.avocadoItem = item;
    } else if (index === 4) {
      // Room 4: gray walls with openings on bottom (back to 2) and right (to 5)
      // Top solid
      let wallTop = this.add.rectangle(400, 10, 800, 20, 0x666666);
      this.physics.add.existing(wallTop);
      wallTop.body.immovable = true;
      this.walls.add(wallTop);

      // Bottom opening
      let wallBottomLeft = this.add.rectangle(136, 590, 272, 20, 0x666666);
      this.physics.add.existing(wallBottomLeft);
      wallBottomLeft.body.immovable = true;
      this.walls.add(wallBottomLeft);

      let wallBottomRight = this.add.rectangle(664, 590, 272, 20, 0x666666);
      this.physics.add.existing(wallBottomRight);
      wallBottomRight.body.immovable = true;
      this.walls.add(wallBottomRight);

      // Left solid
      let wallLeft = this.add.rectangle(10, 300, 20, 600, 0x666666);
      this.physics.add.existing(wallLeft);
      wallLeft.body.immovable = true;
      this.walls.add(wallLeft);

      // Right opening
      let wallRightTop = this.add.rectangle(790, 86, 20, 172, 0x666666);
      this.physics.add.existing(wallRightTop);
      wallRightTop.body.immovable = true;
      this.walls.add(wallRightTop);

      let wallRightBottom = this.add.rectangle(790, 514, 20, 172, 0x666666);
      this.physics.add.existing(wallRightBottom);
      wallRightBottom.body.immovable = true;
      this.walls.add(wallRightBottom);

      // Item - Tomato
      let item = this.add.text(400, 300, '🍅', { fontSize: '48px', color: '#ffffff' });
      item.carriedBy = null;
      this.physics.add.existing(item);
      item.body.setSize(50, 50);
      item.body.setOffset(-25, -25);
      this.physics.add.collider(this.player, item, this.collectItem, null, this);
      this.tomatoItem = item;
    } else if (index === 5) {
      // Room 5: gray walls with openings on left (back to 3) and bottom (back to 4)
      // Top solid
      let wallTop = this.add.rectangle(400, 10, 800, 20, 0x666666);
      this.physics.add.existing(wallTop);
      wallTop.body.immovable = true;
      this.walls.add(wallTop);

      // Bottom opening
      let wallBottomLeft = this.add.rectangle(136, 590, 272, 20, 0x666666);
      this.physics.add.existing(wallBottomLeft);
      wallBottomLeft.body.immovable = true;
      this.walls.add(wallBottomLeft);

      let wallBottomRight = this.add.rectangle(664, 590, 272, 20, 0x666666);
      this.physics.add.existing(wallBottomRight);
      wallBottomRight.body.immovable = true;
      this.walls.add(wallBottomRight);

      // Left opening
      let wallLeftTop = this.add.rectangle(10, 86, 20, 172, 0x666666);
      this.physics.add.existing(wallLeftTop);
      wallLeftTop.body.immovable = true;
      this.walls.add(wallLeftTop);

      let wallLeftBottom = this.add.rectangle(10, 514, 20, 172, 0x666666);
      this.physics.add.existing(wallLeftBottom);
      wallLeftBottom.body.immovable = true;
      this.walls.add(wallLeftBottom);

      // Right solid
      let wallRight = this.add.rectangle(790, 300, 20, 600, 0x666666);
      this.physics.add.existing(wallRight);
      wallRight.body.immovable = true;
      this.walls.add(wallRight);

      // Item bread emoji
      let item = this.add.text(400, 300, '🍞', { fontSize: '48px', color: '#ffffff' });
      item.carriedBy = null;
      this.physics.add.existing(item);
      item.body.setSize(50, 50);
      item.body.setOffset(-25, -25);
      this.physics.add.collider(this.player, item, this.collectItem, null, this);
      this.breadItem = item;
    }
  }

  collectItem(player, item) {
    if (item && item.carriedBy === null) {
      // Handle any item when first collected
      item.carriedBy = this.player;
      this.collected.push(item);
      this.playBeep();
      console.log('Item collected!');
    }
    if (this.collected.length === 5) {
      this.add.text(400, 300, 'You Win! BLAT Sandwich Complete!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    }
  }

  playBeep() {
    // Create a beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: BlatmanGame,
};

game = new Phaser.Game(config);