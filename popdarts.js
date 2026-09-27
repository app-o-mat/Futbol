/* global Phaser */

var game = undefined;
var gameWidth = 900;
var gameHeight = 600;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

const POP_DART_SHOP_ITEMS = [
  {
    id: 'classic',
    name: 'Classic',
    cost: 0,
    mainColor: 0xff5a5a,
    accentColor: 0xffffff,
    colors: ['Red', 'White']
  },
  {
    id: 'basic',
    name: 'Basic',
    cost: 5,
    mainColor: 0x3b82f6,
    accentColor: 0xff4d4d,
    colors: ['Red', 'Green', 'Blue', 'Black']
  },
  {
    id: 'mid',
    name: 'Mediocre',
    cost: 10,
    mainColor: 0xffd166,
    accentColor: 0x00c2ff,
    colors: ['Red', 'Green', 'Blue', 'Black', 'White', 'Yellow']
  },
  {
    id: 'elite',
    name: 'Best',
    cost: 30,
    mainColor: 0xf5d142,
    accentColor: 0xffffff,
    colors: ['Red', 'Green', 'Blue', 'Black', 'White', 'Yellow', 'Shiny']
  }
];

class PopDartsGame extends Phaser.Scene {
  constructor() {
    super();
    this.currentPlayer = 1;
    this.shopPlayer = 1;
    this.round = 1;
    this.maxRounds = 4;
    this.gameInProgress = false;
    this.playerScores = { 1: 0, 2: 0 };
    this.playerSprites = {
      1: parseInt(getCookie('popDartsSpritesP1') || '0', 10),
      2: parseInt(getCookie('popDartsSpritesP2') || '0', 10)
    };
    this.playerSkins = {
      1: getCookie('popDartsSkinP1') || 'classic',
      2: getCookie('popDartsSkinP2') || 'classic'
    };
    this.charge = 0;
    this.isCharging = false;
    this.turnLocked = false;
    this.chargeEvent = null;
    this.shopOpen = false;
  }

  savePlayerProgress() {
    setCookie('popDartsSpritesP1', String(this.playerSprites[1]));
    setCookie('popDartsSpritesP2', String(this.playerSprites[2]));
    setCookie('popDartsSkinP1', String(this.playerSkins[1]));
    setCookie('popDartsSkinP2', String(this.playerSkins[2]));
  }

  getShopItem(key) {
    return POP_DART_SHOP_ITEMS.find((item) => item.id === key) || POP_DART_SHOP_ITEMS[0];
  }

  getPlayerSkinColor(player) {
    return this.getShopItem(this.playerSkins[player]).mainColor;
  }

  getPlayerAccentColor(player) {
    return this.getShopItem(this.playerSkins[player]).accentColor;
  }

  updateShopButtonVisibility() {
    if (!this.shopButton) {
      return;
    }
    this.shopButton.setVisible(!this.gameInProgress);
  }

  preload() {
    // No external assets required for this prototype.
  }

  create() {
    this.cameras.main.setBackgroundColor('#8ccf70');

    this.add.rectangle(gameWidth / 2, 470, gameWidth, 220, 0x8c5a37);
    this.add.rectangle(gameWidth / 2, 365, gameWidth - 150, 80, 0x78563b);

    this.add.rectangle(130, 220, 180, 220, 0x3c3c3c);
    this.add.rectangle(260, 220, 180, 220, 0x3c3c3c);

    this.playerOneToken = this.add.circle(130, 120, 32, 0xff5a5a);
    this.playerTwoToken = this.add.circle(260, 120, 32, 0x4de26d);

    this.playerOneLabel = this.add.text(130, 175, 'Player 1', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.playerTwoLabel = this.add.text(260, 175, 'Player 2', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.playerOneScoreText = this.add.text(75, 285, 'P1: 0', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.playerTwoScoreText = this.add.text(215, 285, 'P2: 0', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.playerOneSpritesText = this.add.text(130, 220, 'Sprites: 0', {
      fontSize: '18px',
      color: '#fff7b3',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.playerTwoSpritesText = this.add.text(260, 220, 'Sprites: 0', {
      fontSize: '18px',
      color: '#fff7b3',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.turnText = this.add.text(130, 25, "Player 1's turn", {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    this.roundText = this.add.text(700, 30, 'Round 1 / 4', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    this.statusText = this.add.text(gameWidth / 2, 90, 'Hold Space to aim', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.targetX = 670;
    this.targetY = 330;

    this.targetRing4 = this.add.circle(this.targetX, this.targetY, 112, 0x3d7ef7, 0.18);
    this.targetRing3 = this.add.circle(this.targetX, this.targetY, 82, 0x3d7ef7, 0.22);
    this.targetRing2 = this.add.circle(this.targetX, this.targetY, 58, 0x3d7ef7, 0.28);
    this.targetRing1 = this.add.circle(this.targetX, this.targetY, 36, 0x3d7ef7, 0.36);
    this.targetCore = this.add.circle(this.targetX, this.targetY, 22, 0x4dc2ff, 1);

    this.add.text(this.targetX, this.targetY - 120, '4', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(this.targetX, this.targetY - 86, '3', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(this.targetX, this.targetY - 54, '2', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(this.targetX, this.targetY - 22, '1', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(this.targetX, this.targetY + 55, '5', {
      fontSize: '30px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.chargeBarBg = this.add.rectangle(350, 505, 300, 30, 0x2d2d2d);
    this.chargeBar = this.add.rectangle(200, 505, 0, 22, 0xff4d4d).setOrigin(0, 0.5);
    this.chargeGoalMarker = this.add.rectangle(350 + 75, 505, 8, 36, 0x8dff8d, 0.9);
    this.chargeText = this.add.text(350, 470, '0%', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown-SPACE', () => this.startCharge());
    this.input.keyboard.on('keyup-SPACE', () => this.releaseCharge());

    this.shopButton = this.add.text(gameWidth - 30, 20, 'Shop', {
      fontSize: '26px',
      color: '#fff4b0',
      fontStyle: 'bold'
    }).setOrigin(1, 0);
    this.shopButton.setInteractive();
    this.shopButton.on('pointerdown', () => this.openShop());
    this.shopButton.setVisible(!this.gameInProgress);

    this.shopPanel = this.add.container(0, 0);
    this.shopPanel.setVisible(false);

    const panelBackground = this.add.rectangle(gameWidth / 2, gameHeight / 2, 640, 440, 0x1e1e1e, 0.96);
    panelBackground.setStrokeStyle(4, 0xf5d142);
    this.shopPanel.add(panelBackground);

    this.shopTitle = this.add.text(gameWidth / 2, 120, 'Pop Dart Shop', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.shopPanel.add(this.shopTitle);

    this.shopPlayerText = this.add.text(gameWidth / 2, 165, 'Player 1 is shopping', {
      fontSize: '22px',
      color: '#fff7b3',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.shopPanel.add(this.shopPlayerText);

    this.shopPlayerBalanceText = this.add.text(gameWidth / 2, 195, 'Sprites: 0', {
      fontSize: '18px',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.shopPanel.add(this.shopPlayerBalanceText);

    this.shopP1Button = this.add.text(180, 165, 'P1', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.shopP1Button.setInteractive();
    this.shopP1Button.on('pointerdown', () => { this.shopPlayer = 1; this.renderShop(); });
    this.shopPanel.add(this.shopP1Button);

    this.shopP2Button = this.add.text(720, 165, 'P2', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.shopP2Button.setInteractive();
    this.shopP2Button.on('pointerdown', () => { this.shopPlayer = 2; this.renderShop(); });
    this.shopPanel.add(this.shopP2Button);

    this.shopCloseText = this.add.text(gameWidth / 2, 500, 'Close Shop', {
      fontSize: '24px',
      color: '#4de26d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.shopCloseText.setInteractive();
    this.shopCloseText.on('pointerdown', () => this.closeShop());
    this.shopPanel.add(this.shopCloseText);

    this.shopItemContainer = this.add.container(0, 0);
    this.shopPanel.add(this.shopItemContainer);

    this.updateTurnDisplay();
    this.updateChargeBar();
    this.updateShopButtonVisibility();
  }

  updateTurnDisplay() {
    this.turnText.setText(`Player ${this.currentPlayer}'s turn`);
    this.roundText.setText(`Round ${this.round} / ${this.maxRounds}`);
    this.playerOneScoreText.setText(`P1: ${this.playerScores[1]}`);
    this.playerTwoScoreText.setText(`P2: ${this.playerScores[2]}`);
    this.playerOneSpritesText.setText(`Sprites: ${this.playerSprites[1]}`);
    this.playerTwoSpritesText.setText(`Sprites: ${this.playerSprites[2]}`);
    if (this.shopPlayerText) {
      this.shopPlayerText.setText(`Player ${this.shopPlayer} is shopping`);
    }
    if (this.shopPlayerBalanceText) {
      this.shopPlayerBalanceText.setText(`Sprites: ${this.playerSprites[this.shopPlayer]}`);
    }
    if (this.shopButton) {
      this.shopButton.setVisible(!this.gameInProgress);
    }
  }

  renderShop() {
    this.shopItemContainer.removeAll(true);
    this.shopPlayerText.setText(`Player ${this.shopPlayer} is shopping`);
    this.shopPlayerBalanceText.setText(`Sprites: ${this.playerSprites[this.shopPlayer]}`);
    this.shopP1Button.setFill(this.shopPlayer === 1 ? '#ffd166' : '#ffffff');
    this.shopP2Button.setFill(this.shopPlayer === 2 ? '#ffd166' : '#ffffff');

    POP_DART_SHOP_ITEMS.forEach((item, index) => {
      const isOwned = this.playerSkins[this.shopPlayer] === item.id;
      const canAfford = this.playerSprites[this.shopPlayer] >= item.cost;
      const cardX = gameWidth / 2 + ((index % 2 === 0) ? -180 : 180);
      const cardY = 285 + Math.floor(index / 2) * 140;

      const card = this.add.rectangle(cardX, cardY, 180, 110, 0x2c2c2c, 0.95);
      card.setStrokeStyle(3, isOwned ? 0x4de26d : 0xffffff);
      this.shopItemContainer.add(card);

      const colorPreview = this.add.circle(cardX - 52, cardY - 18, 12, item.mainColor);
      colorPreview.setStrokeStyle(2, item.accentColor);
      this.shopItemContainer.add(colorPreview);

      const title = this.add.text(cardX + 18, cardY - 22, item.name, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      this.shopItemContainer.add(title);

      const costText = this.add.text(cardX, cardY + 8, `Cost: ${item.cost}`, {
        fontSize: '16px',
        color: '#ffd166',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      this.shopItemContainer.add(costText);

      const colorsText = this.add.text(cardX, cardY + 28, item.colors.join(', '), {
        fontSize: '12px',
        color: '#d0d0d0',
        align: 'center',
        wordWrap: { width: 140 }
      }).setOrigin(0.5, 0.5);
      this.shopItemContainer.add(colorsText);

      let buyText = 'Owned';
      if (!isOwned && canAfford) {
        buyText = 'Buy';
      } else if (!isOwned && !canAfford) {
        buyText = 'Need Sprites';
      }

      const buyLabel = this.add.text(cardX, cardY + 50, buyText, {
        fontSize: '14px',
        color: isOwned ? '#4de26d' : canAfford ? '#7ae0ff' : '#ff8f8f',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      this.shopItemContainer.add(buyLabel);

      if (!isOwned && canAfford) {
        card.setInteractive();
        card.on('pointerdown', () => this.buyItem(item.id));
        buyLabel.setInteractive();
        buyLabel.on('pointerdown', () => this.buyItem(item.id));
      }
    });
  }

  openShop() {
    if (this.gameInProgress) {
      return;
    }

    this.shopOpen = true;
    this.shopPanel.setVisible(true);
    this.shopPlayer = 1;
    this.renderShop();
  }

  closeShop() {
    this.shopOpen = false;
    this.shopPanel.setVisible(false);
  }

  buyItem(itemId) {
    const item = POP_DART_SHOP_ITEMS.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    const player = this.shopPlayer;
    if (this.playerSkins[player] === item.id) {
      this.statusText.setText('That pop dart is already equipped.');
      return;
    }

    if (this.playerSprites[player] < item.cost) {
      this.statusText.setText('Not enough sprites for that pop dart.');
      return;
    }

    this.playerSprites[player] -= item.cost;
    this.playerSkins[player] = item.id;
    this.savePlayerProgress();
    this.statusText.setText(`Player ${player} bought ${item.name}!`);
    this.updateTurnDisplay();
    this.renderShop();
  }

  startCharge() {
    if (this.turnLocked || this.isCharging) {
      return;
    }

    this.isCharging = true;
    this.charge = 0;
    this.statusText.setText('Charging...');
    this.chargeEvent = this.time.addEvent({
      delay: 25,
      callback: () => {
        this.charge = Math.min(100, this.charge + 2);
        this.updateChargeBar();
      },
      loop: true
    });
  }

  releaseCharge() {
    if (!this.isCharging || this.shopOpen) {
      return;
    }

    this.isCharging = false;
    if (this.chargeEvent) {
      this.chargeEvent.remove();
      this.chargeEvent = null;
    }

    this.throwDart(this.charge);
  }

  updateChargeBar() {
    this.chargeBar.setSize(300 * (this.charge / 100), 22);
    this.chargeBar.x = 200;

    let meterColor = 0xff4d4d;
    if (this.charge >= 75) {
      meterColor = 0x47e36b;
    } else if (this.charge >= 50) {
      meterColor = 0xffb347;
    }

    this.chargeBar.setFillStyle(meterColor);
    this.chargeText.setText(Math.round(this.charge) + '%');
    this.chargeGoalMarker.x = 200 + 225;
  }

  throwDart(percent) {
    this.turnLocked = true;
    this.gameInProgress = true;

    const playerColor = this.getPlayerSkinColor(this.currentPlayer);
    const accentColor = this.getPlayerAccentColor(this.currentPlayer);
    const startX = this.currentPlayer === 1 ? 100 : 290;
    const startY = 410;

    const targetX = this.targetX;
    const targetY = this.targetY;
    const landingX = targetX + (percent - 75) * 4.5;
    const landingY = targetY + (Math.random() - 0.5) * 80;

    const dart = this.add.circle(startX, startY, 6, playerColor);
    dart.setStrokeStyle(2, accentColor);

    this.tweens.add({
      targets: dart,
      x: landingX,
      y: landingY,
      duration: 700,
      ease: 'Cubic.Out',
      onComplete: () => {
        const hit = this.add.circle(landingX, landingY, 8, 0xffffff, 0.85);
        hit.setStrokeStyle(3, accentColor);
        this.tweens.add({
          targets: hit,
          scale: { from: 1, to: 1.5 },
          alpha: { from: 1, to: 0 },
          duration: 500,
          onComplete: () => hit.destroy()
        });
        dart.destroy();
      }
    });

    const distance = Phaser.Math.Distance.Between(targetX, targetY, landingX, landingY);
    const score = this.scoreForDistance(distance);
    this.playerScores[this.currentPlayer] += score;

    this.statusText.setText(`Player ${this.currentPlayer} scored ${score}!`);
    this.updateTurnDisplay();

    this.time.delayedCall(1200, () => {
      this.advanceTurn();
    });
  }

  scoreForDistance(distance) {
    if (distance <= 22) {
      return 5;
    }
    if (distance <= 52) {
      return 4;
    }
    if (distance <= 88) {
      return 3;
    }
    if (distance <= 120) {
      return 2;
    }
    return 1;
  }

  advanceTurn() {
    if (this.currentPlayer === 1) {
      this.currentPlayer = 2;
      this.turnLocked = false;
      this.charge = 0;
      this.gameInProgress = false;
      this.updateChargeBar();
      this.statusText.setText('Hold Space to aim');
      this.updateTurnDisplay();
      this.updateShopButtonVisibility();
      return;
    }

    if (this.round >= this.maxRounds) {
      this.finishGame();
      return;
    }

    this.round += 1;
    this.currentPlayer = 1;
    this.turnLocked = false;
    this.charge = 0;
    this.gameInProgress = false;
    this.updateChargeBar();
    this.statusText.setText('Hold Space to aim');
    this.updateTurnDisplay();
    this.updateShopButtonVisibility();
  }

  finishGame() {
    this.gameInProgress = false;
    let message = 'Draw! +5 sprites each';
    if (this.playerScores[1] > this.playerScores[2]) {
      this.playerSprites[1] += 10;
      message = 'Player 1 wins! +10 sprites';
    } else if (this.playerScores[2] > this.playerScores[1]) {
      this.playerSprites[2] += 10;
      message = 'Player 2 wins! +10 sprites';
    } else {
      this.playerSprites[1] += 5;
      this.playerSprites[2] += 5;
    }

    this.savePlayerProgress();
    this.statusText.setText(message);
    this.updateTurnDisplay();
    this.updateShopButtonVisibility();

    this.time.delayedCall(2200, () => {
      this.round = 1;
      this.currentPlayer = 1;
      this.playerScores = { 1: 0, 2: 0 };
      this.turnLocked = false;
      this.charge = 0;
      this.updateChargeBar();
      this.statusText.setText('New game ready. Hold Space to aim');
      this.updateTurnDisplay();
      this.updateShopButtonVisibility();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: PopDartsGame,
};

game = new Phaser.Game(config);
