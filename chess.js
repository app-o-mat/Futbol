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
    // which side to move: 'white' starts
    this.turn = "white";
  }

  // Enable draggable only for pieces that belong to the side to move
  updateDraggables() {
    this.children.list.forEach((child) => {
      if (!child.getData || !child.getData("isPiece")) return;
      const allowed = child.getData("color") === this.turn;
      try {
        this.input.setDraggable(child, allowed);
      } catch (e) {
        if (!allowed) this.input.setDraggable(child, false);
      }
      child.setInteractive({ cursor: allowed ? "pointer" : "default" });
    });
  }

  // Validate a proposed move: (piece, {col, row}) -> boolean
  // Empty/placeholder for now — always allow moves.
  isValidPawnMove(piece, target) {
    const color = piece.getData("color");
    const dir = color === "white" ? -1 : 1;
    const row = piece.getData("row");
    const col = piece.getData("col");
    const tr = target.row;
    const tc = target.col;

    // Forward move
    if (tc === col) {
      // one square forward
      if (tr === row + dir) {
        return this.board[tr][tc] == null;
      }
      // two squares from starting rank
      const startRow = color === "white" ? 6 : 1;
      if (row === startRow && tr === row + 2 * dir) {
        // both squares must be empty
        const intermediateRow = row + dir;
        return (
          this.board[intermediateRow][tc] == null && this.board[tr][tc] == null
        );
      }
      return false;
    }

    // Diagonal capture (including en passant)
    if (Math.abs(tc - col) === 1 && tr === row + dir) {
      // normal capture
      const targetPiece = this.board[tr] && this.board[tr][tc];
      if (targetPiece && targetPiece.getData("color") !== color) return true;

      // en passant: target square empty but there is an enemy pawn adjacent that just double-moved
      const adjacentRow = row; // enemy pawn sits on same row as moving pawn
      const adjacentPiece =
        this.board[adjacentRow] && this.board[adjacentRow][tc];
      if (
        adjacentPiece &&
        adjacentPiece.getData("type") === "pawn" &&
        adjacentPiece.getData("color") !== color &&
        this.lastDoublePawn &&
        this.lastDoublePawn.piece === adjacentPiece
      ) {
        return true;
      }
      return false;
    }

    return false;
  }

  isValidMove(piece, target) {
    // Basic validation
    if (!piece || !piece.getData) return true;

    // If target square contains a same-color piece, move is invalid for any piece
    if (
      target &&
      typeof target.row === "number" &&
      typeof target.col === "number"
    ) {
      const tp = this.board[target.row] && this.board[target.row][target.col];
      if (tp && tp.getData && tp.getData("color") === piece.getData("color"))
        return false;
    }

    const type = piece.getData("type");
    if (type === "pawn") return this.isValidPawnMove(piece, target);

    // Queen movement: horizontal, vertical, diagonal any distance, no jumping
    if (type === "queen") {
      const row = piece.getData("row");
      const col = piece.getData("col");
      const tr = target.row;
      const tc = target.col;

      // can't stay in place
      if (tr === row && tc === col) return false;

      const dRow = tr - row;
      const dCol = tc - col;

      // determine direction: horizontal, vertical, or diagonal
      const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
      const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);

      // valid directions for queen: either stepRow==0 or stepCol==0 or abs(dRow)==abs(dCol)
      if (
        !(stepRow === 0 || stepCol === 0 || Math.abs(dRow) === Math.abs(dCol))
      ) {
        return false;
      }

      // walk from source towards target, but stop before target; ensure no blocking pieces
      let r = row + stepRow;
      let c = col + stepCol;
      while (r !== tr || c !== tc) {
        if (this.board[r] && this.board[r][c]) return false;
        r += stepRow;
        c += stepCol;
      }

      // target square either empty or occupied by enemy (same-color check handled earlier)
      return true;
    }

    // Rook movement: horizontal or vertical any distance, no jumping
    if (type === "rook") {
      const row = piece.getData("row");
      const col = piece.getData("col");
      const tr = target.row;
      const tc = target.col;

      // can't stay in place
      if (tr === row && tc === col) return false;

      // must move only horizontally or only vertically
      if (tr !== row && tc !== col) return false;

      // determine direction
      const dRow = tr - row;
      const dCol = tc - col;
      const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
      const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);

      // walk from source towards target, ensure no blocking pieces
      let r = row + stepRow;
      let c = col + stepCol;
      while (r !== tr || c !== tc) {
        if (this.board[r] && this.board[r][c]) return false;
        r += stepRow;
        c += stepCol;
      }

      return true;
    }

    // King movement: one square in any direction
    if (type === "king") {
      const row = piece.getData("row");
      const col = piece.getData("col");
      const tr = target.row;
      const tc = target.col;

      // can't stay in place
      if (tr === row && tc === col) return false;

      // must move exactly one square
      const dRow = Math.abs(tr - row);
      const dCol = Math.abs(tc - col);

      // king can move one square horizontally, vertically, or diagonally
      if (dRow <= 1 && dCol <= 1) {
        return true;
      }

      return false;
    }

    // Bishop movement: diagonal any distance, no jumping
    if (type === "bishop") {
      const row = piece.getData("row");
      const col = piece.getData("col");
      const tr = target.row;
      const tc = target.col;

      // can't stay in place
      if (tr === row && tc === col) return false;

      const dRow = tr - row;
      const dCol = tc - col;

      // must move diagonally (abs(dRow) == abs(dCol))
      if (Math.abs(dRow) !== Math.abs(dCol)) return false;

      // determine direction
      const stepRow = dRow / Math.abs(dRow);
      const stepCol = dCol / Math.abs(dCol);

      // walk from source towards target, ensure no blocking pieces
      let r = row + stepRow;
      let c = col + stepCol;
      while (r !== tr || c !== tc) {
        if (this.board[r] && this.board[r][c]) return false;
        r += stepRow;
        c += stepCol;
      }

      return true;
    }

    return true;
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

    // create and store square rectangles so we can highlight them later
    this.squares = [];
    for (let r = 0; r < rows; r++) {
      this.squares[r] = [];
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * tile + tile / 2;
        const y = offsetY + r * tile + tile / 2;
        const isLight = (r + c) % 2 === 0;
        const rect = this.add
          .rectangle(x, y, tile, tile, isLight ? light : dark)
          .setOrigin(0.5);
        rect.setData("row", r);
        rect.setData("col", c);
        this.squares[r][c] = rect;
      }
    }
    // initialize board occupancy array
    this.board = new Array(rows);
    for (let r = 0; r < rows; r++) {
      this.board[r] = new Array(cols).fill(null);
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
      pawn.setData("type", "pawn");
      pawn.setData("color", "white");
      pawn.setData("row", pawnRow);
      pawn.setData("col", c);
      this.board[pawnRow][c] = pawn;
    }

    // Drag handlers: allow dragging pawns and snapping them to the nearest square
    this.input.on("dragstart", (pointer, gameObject) => {
      if (!gameObject.getData || !gameObject.getData("isPiece")) return;

      // if the object isn't draggable (set by updateDraggables), cancel
      if (!gameObject.input || !gameObject.input.draggable) {
        gameObject.setAlpha(1);
        gameObject.setDepth(1);
        return;
      }
      gameObject.setDepth(2);
      gameObject.setAlpha(0.4);
      // mark currently dragging piece for hover checks
      this.draggingPiece = gameObject;
      // store original board coords in case we need to snap back
      gameObject.setData("origRow", gameObject.getData("row"));
      gameObject.setData("origCol", gameObject.getData("col"));
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (!gameObject.getData || !gameObject.getData("isPiece")) return;
      gameObject.x = dragX;
      gameObject.y = dragY;
      // update highlight while dragging
      this.updateHighlightAt(dragX, dragY, gameObject);
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

      const piece = gameObject;
      const oldRow = piece.getData("row");
      const oldCol = piece.getData("col");

      // validate move
      if (this.isValidMove(piece, { row, col })) {
        // handle captures
        const targetPiece = this.board[row][col];
        // en passant capture: diagonal move into empty square
        let performedEnPassant = false;
        if (
          piece.getData("type") === "pawn" &&
          col !== oldCol &&
          !targetPiece
        ) {
          // enemy pawn to capture sits on oldRow, col
          const adjacent = this.board[oldRow] && this.board[oldRow][col];
          if (
            adjacent &&
            adjacent === (this.lastDoublePawn && this.lastDoublePawn.piece)
          ) {
            // remove captured pawn
            adjacent.destroy();
            this.board[oldRow][col] = null;
            performedEnPassant = true;
          }
        }

        if (targetPiece) {
          // normal capture
          targetPiece.destroy();
          this.board[row][col] = null;
        }

        // update board occupancy
        this.board[oldRow][oldCol] = null;
        this.board[row][col] = piece;

        // place piece and update metadata
        piece.x = snapX;
        piece.y = snapY;
        piece.setData("row", row);
        piece.setData("col", col);

        // track last double pawn move (for en passant)
        if (piece.getData("type") === "pawn" && Math.abs(row - oldRow) === 2) {
          this.lastDoublePawn = { piece, row, col };
        } else {
          // clear previous double pawn unless we just created one
          this.lastDoublePawn = null;
        }

        gameObject.setDepth(1);
        gameObject.setAlpha(1);
        // toggle turn after a successful move
        this.turn = this.turn === "white" ? "black" : "white";
        // enable/disable draggables for the new turn
        this.updateDraggables();
      } else {
        // invalid move: snap back to original
        const or = piece.getData("origRow");
        const oc = piece.getData("origCol");
        const backX = this.offsetX + oc * this.tile + this.tile / 2;
        const backY = this.offsetY + or * this.tile + this.tile / 2;
        piece.x = backX;
        piece.y = backY;
        piece.setAlpha(1);
        piece.setDepth(1);
      }

      // clear highlight and dragging state
      this.clearHighlight();
      this.draggingPiece = null;
    });

    // pointermove should also update highlight if dragging
    this.input.on("pointermove", (pointer) => {
      if (this.draggingPiece) {
        this.updateHighlightAt(pointer.x, pointer.y, this.draggingPiece);
      }
    });

    // helper: highlight a square at screen x,y for given piece
    this.updateHighlightAt = (x, y, piece) => {
      // compute column/row
      const col = Math.floor((x - this.offsetX) / this.tile);
      const row = Math.floor((y - this.offsetY) / this.tile);
      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
        this.clearHighlight();
        return;
      }
      // if same as last highlighted, do nothing
      if (
        this.lastHighlighted &&
        this.lastHighlighted.col === col &&
        this.lastHighlighted.row === row
      ) {
        return;
      }
      // clear previous
      this.clearHighlight();
      const valid = this.isValidMove(piece, { col, row });
      const rect = this.squares[row][col];
      if (rect) {
        // set stroke: green for valid, red for invalid
        const color = valid ? 0x00ff00 : 0xff0000;
        rect.setStrokeStyle(4, color);
        this.lastHighlighted = { col, row };
      }
    };

    this.clearHighlight = () => {
      if (this.lastHighlighted) {
        const { col, row } = this.lastHighlighted;
        const rect = this.squares[row] && this.squares[row][col];
        if (rect) rect.setStrokeStyle(0);
        this.lastHighlighted = null;
      }
    };

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
    king.setData("type", "king");
    king.setData("color", "white");
    king.setData("row", kingRow);
    king.setData("col", kingCol);
    this.board[kingRow][kingCol] = king;

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
    queen.setData("type", "queen");
    queen.setData("color", "white");
    queen.setData("row", queenRow);
    queen.setData("col", queenCol);
    this.board[queenRow][queenCol] = queen;

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
      // derive type from key (white-rook -> rook)
      const parts = key.split("-");
      const type = parts.length > 1 ? parts[1] : parts[0];
      p.setData("type", type);
      p.setData("color", "white");
      p.setData("row", whiteBackRow);
      p.setData("col", c);
      this.board[whiteBackRow][c] = p;
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
      bp.setData("type", "pawn");
      bp.setData("color", "black");
      bp.setData("row", blackPawnRow);
      bp.setData("col", c);
      this.board[blackPawnRow][c] = bp;
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
      const parts = key.split("-");
      const type = parts.length > 1 ? parts[1] : parts[0];
      p.setData("type", type);
      p.setData("color", "black");
      p.setData("row", backRow);
      p.setData("col", c);
      this.board[backRow][c] = p;
    }
    // after creating all pieces, enable draggables for the starting side
    this.updateDraggables();
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
