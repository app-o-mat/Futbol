/* global Phaser */
const tile = 64; // size of each square
const cols = 8;
const rows = 8;
const boardWidth = tile * cols;
const boardHeight = tile * rows;

const light = 0xf0d9b5;
const dark = 0xb58863;

class ChessScene extends Phaser.Scene {
  constructor() {
    super({ key: "ChessScene" });
  }

  preload() {
    // Load the white pawn image
    this.load.image("pawn", "/assets/chess/white-pawn.jpg");
    // Load the white king image
    this.load.image("king", "/assets/chess/white-king.jpeg");
    // Load the white queen image
    this.load.image("queen", "/assets/chess/white-queen.png");
    // Load remaining white pieces
    this.load.image("white-rook", "/assets/chess/white-rook.jpeg");
    this.load.image("white-knight", "/assets/chess/white-knight.jpg");
    this.load.image("white-bishop", "/assets/chess/white-bishop.jpeg");
    // Load black pieces
    this.load.image("black-pawn", "/assets/chess/black-pawn.png");
    this.load.image("black-rook", "/assets/chess/black-rook.png");
    this.load.image("black-knight", "/assets/chess/black-knight.jpg");
    this.load.image("black-bishop", "/assets/chess/black-bishop.png");
    this.load.image("black-queen", "/assets/chess/black-queen.png");
    this.load.image("black-king", "/assets/chess/black-king.png");
  }

  createBoard() {
    // Center the board in the canvas
    const offsetX = (this.scale.width - boardWidth) / 2;
    const offsetY = (this.scale.height - boardHeight) / 2;

    // Keep board metrics on the scene for drag handlers
    this.tile = tile;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.cols = cols;
    this.rows = rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * tile + tile / 2;
        const y = offsetY + r * tile + tile / 2;
        const isLight = (r + c) % 2 === 0;
        this.add
          .rectangle(x, y, tile, tile, isLight ? light : dark)
          .setOrigin(0.5);
      }
    }
  }

  createWhitePawns() {}

  createWhiteKing() {}

  createWhiteQueen() {}

  create() {
    this.createBoard();

    // Add white pawns on the white pawn rank (row 6, second from bottom)
    const pawnRow = 6; // 0-indexed (0 top -> 7 bottom)
    for (let c = 0; c < cols; c++) {
      const x = this.offsetX + c * tile + tile / 2;
      const y = this.offsetY + pawnRow * tile + tile / 2;
      const pawn = this.add.image(x, y, "pawn");
      // Scale the pawn to fit nicely inside the tile
      const scaleFactor = (tile * 0.8) / Math.max(pawn.width, pawn.height);
      pawn.setDisplaySize(pawn.width * scaleFactor, pawn.height * scaleFactor);
      pawn.setDepth(1);
      // Make pawns interactive and draggable
      pawn.setInteractive({ cursor: "pointer" });
      this.input.setDraggable(pawn);
      pawn.setData("isPiece", true);
    }

    // Drag handlers: allow dragging pawns and snapping them to the nearest square
    this.input.on("dragstart", (pointer, gameObject) => {
      if (!gameObject.getData || !gameObject.getData("isPiece")) return;
      gameObject.setDepth(2);
      gameObject.setAlpha(0.4);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (!gameObject.getData || !gameObject.getData("isPiece")) return;
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("dragend", (pointer, gameObject) => {
      if (!gameObject.getData || !gameObject.getData("isPiece")) return;
      // Snap to nearest column/row within board bounds
      const col = Math.max(
        0,
        Math.min(
          this.cols - 1,
          Math.floor((gameObject.x - this.offsetX) / this.tile)
        )
      );
      const row = Math.max(
        0,
        Math.min(
          this.rows - 1,
          Math.floor((gameObject.y - this.offsetY) / this.tile)
        )
      );
      const snapX = this.offsetX + col * this.tile + this.tile / 2;
      const snapY = this.offsetY + row * this.tile + this.tile / 2;
      gameObject.x = snapX;
      gameObject.y = snapY;
      gameObject.setDepth(1);
      gameObject.setAlpha(1);
    });

    // Add white king on e1 (column 4, bottom row 7)
    const kingCol = 4; // 0-indexed (a=0 ... h=7)
    const kingRow = 7; // bottom row
    const kingX = this.offsetX + kingCol * tile + tile / 2;
    const kingY = this.offsetY + kingRow * tile + tile / 2;
    const king = this.add.image(kingX, kingY, "king");
    const kingScale = (tile * 0.9) / Math.max(king.width, king.height);
    king.setDisplaySize(king.width * kingScale, king.height * kingScale);
    king.setDepth(1);
    // make king draggable/selectable
    king.setInteractive({ cursor: "pointer" });
    this.input.setDraggable(king);
    king.setData("isPiece", true);

    // Add white queen on d1 (column 3, bottom row 7)
    const queenCol = 3;
    const queenRow = 7;
    const queenX = this.offsetX + queenCol * tile + tile / 2;
    const queenY = this.offsetY + queenRow * tile + tile / 2;
    const queen = this.add.image(queenX, queenY, "queen");
    const queenScale = (tile * 0.9) / Math.max(queen.width, queen.height);
    queen.setDisplaySize(queen.width * queenScale, queen.height * queenScale);
    queen.setDepth(1);
    queen.setInteractive({ cursor: "pointer" });
    this.input.setDraggable(queen);
    queen.setData("isPiece", true);

    // White back rank pieces (rooks, knights, bishops) - skip queen/king positions
    const whiteBackRow = 7;
    const whiteOrder = [
      "white-rook",
      "white-knight",
      "white-bishop",
      null,
      null,
      "white-bishop",
      "white-knight",
      "white-rook",
    ];

    for (let c = 0; c < cols; c++) {
      const key = whiteOrder[c];
      if (!key) continue; // queen/king already placed
      const x = this.offsetX + c * tile + tile / 2;
      const y = this.offsetY + whiteBackRow * tile + tile / 2;
      const p = this.add.image(x, y, key);
      const s = (tile * 0.9) / Math.max(p.width, p.height);
      p.setDisplaySize(p.width * s, p.height * s);
      p.setDepth(1);
      p.setInteractive({ cursor: "pointer" });
      this.input.setDraggable(p);
      p.setData("isPiece", true);
    }

    // --- Black pieces ---
    // Black pawns on row 1
    const blackPawnRow = 1;
    for (let c = 0; c < cols; c++) {
      const x = this.offsetX + c * tile + tile / 2;
      const y = this.offsetY + blackPawnRow * tile + tile / 2;
      const bp = this.add.image(x, y, "black-pawn");
      const sf = (tile * 0.8) / Math.max(bp.width, bp.height);
      bp.setDisplaySize(bp.width * sf, bp.height * sf);
      bp.setDepth(1);
      bp.setInteractive({ cursor: "pointer" });
      this.input.setDraggable(bp);
      bp.setData("isPiece", true);
    }

    // Black back rank on row 0
    const backRow = 0;
    const order = [
      "rook",
      "knight",
      "bishop",
      "queen",
      "king",
      "bishop",
      "knight",
      "rook",
    ];
    for (let c = 0; c < cols; c++) {
      const key = `black-${order[c]}`;
      const x = this.offsetX + c * tile + tile / 2;
      const y = this.offsetY + backRow * tile + tile / 2;
      const p = this.add.image(x, y, key);
      const s = (tile * 0.9) / Math.max(p.width, p.height);
      p.setDisplaySize(p.width * s, p.height * s);
      p.setDepth(1);
      p.setInteractive({ cursor: "pointer" });
      this.input.setDraggable(p);
      p.setData("isPiece", true);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  backgroundColor: "#cccccc",
  scene: ChessScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
