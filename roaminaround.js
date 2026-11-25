import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.172.0/build/three.module.js";

const WORLD_SIZE = 80;
const WORLD_LIMIT = WORLD_SIZE / 2 - 0.45;
const PLAYER_RADIUS = 0.36;
const PLAYER_EYE_HEIGHT = 1.65;
const MOVE_SPEED = 5.5;
const TURN_SPEED = 2.3;

const cubeLayout = [
  [-5, 8, 2, 2, 2, 0xe53935],
  [5, 8, 2, 3, 2, 0x2455db],
  [-1.5, 3, 2.4, 2.4, 1.5, 0xf5c928],
  [3, 0, 1.6, 4, 2, 0xe53935],
  [-6, -1, 2.3, 1.6, 2, 0x2455db],
  [-3, -7, 3, 2, 2, 0xf5c928],
  [4, -7, 2, 2.5, 2, 0x2455db],
  [8, -10, 2, 3.8, 2, 0xe53935],
  [-8, -12, 1.7, 2.3, 2, 0xf5c928],
  [-5, -18, 2, 2, 2, 0x2455db],
  [1, -16, 3, 3, 2, 0xe53935],
  [8, -20, 2.5, 2, 2, 0xf5c928],
  [-9, -23, 3, 3.5, 2, 0xe53935],
  [0, -25, 2, 2, 2, 0x2455db],
  [6, -28, 3, 3, 3, 0xf5c928],
  [-14, 3, 2, 2.5, 2, 0xf5c928],
  [14, 1, 2.5, 2, 2, 0xe53935],
  [-16, -9, 3, 3, 2, 0x2455db],
  [16, -14, 2, 2.5, 2, 0xf5c928],
  [-14, -29, 2.5, 2, 2, 0xe53935],
  [14, -31, 2, 3.5, 2, 0x2455db],
  [-22, -18, 3, 2, 3, 0xf5c928],
  [23, -5, 2.5, 3, 2, 0xe53935],
  [22, -27, 3, 2, 3, 0x2455db],
];

function createCheckerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create the checkerboard floor texture.");
  }

  const tileSize = 16;
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      context.fillStyle = (row + column) % 2 === 0 ? "#dce1e4" : "#abb5bb";
      context.fillRect(column * tileSize, row * tileSize, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

class RoaminAroundScene extends Phaser.Scene {
  constructor() {
    super({ key: "RoaminAroundScene" });
    this.obstacles = [];
    this.playerPosition = new THREE.Vector3(0, PLAYER_EYE_HEIGHT, 14);
    this.playerYaw = 0;
  }

  create() {
    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(0x91aab8);
    this.threeScene.fog = new THREE.Fog(0x91aab8, 38, 62);

    this.camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.rotation.order = "YXZ";

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById("three-world").appendChild(this.renderer.domElement);

    this.threeScene.add(new THREE.HemisphereLight(0xffffff, 0x75808a, 2.2));

    const sunlight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunlight.position.set(-8, 18, 10);
    this.threeScene.add(sunlight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
      new THREE.MeshStandardMaterial({
        map: createCheckerTexture(),
        roughness: 1,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    this.threeScene.add(floor);

    for (const [x, z, width, height, depth, color] of cubeLayout) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.58 })
      );
      cube.position.set(x, height / 2, z);
      this.threeScene.add(cube);
      this.obstacles.push({
        x,
        z,
        halfWidth: width / 2,
        halfDepth: depth / 2,
      });
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.createHud();
    this.resizeHandler = () => this.resizeThreeRenderer();
    window.addEventListener("resize", this.resizeHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("resize", this.resizeHandler);
      this.renderer.dispose();
      this.renderer.domElement.remove();
    });

    this.renderThreeScene();
  }

  createHud() {
    this.hudPanel = this.add.graphics().setDepth(10);
    this.titleText = this.add
      .text(40, 35, "ROAMINAROUND", {
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        fontStyle: "bold",
        color: "#ffffff",
        letterSpacing: 1,
      })
      .setDepth(11);
    this.controlsText = this.add
      .text(40, 67, "↑ / W WALK   ← / A  TURN  D / →   S / ↓ BACK UP", {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#e5edf2",
      })
      .setDepth(11);
    this.crosshair = this.add.graphics().setDepth(10);
    this.layoutHud(this.scale.gameSize);
    this.scale.on("resize", this.layoutHud, this);
  }

  layoutHud(gameSize) {
    this.hudPanel.clear();
    this.hudPanel.fillStyle(0x14202b, 0.72);
    this.hudPanel.fillRoundedRect(20, 20, 440, 82, 10);

    const centerX = gameSize.width / 2;
    const centerY = gameSize.height / 2;
    this.crosshair.clear();
    this.crosshair.lineStyle(2, 0xffffff, 0.8);
    this.crosshair.lineBetween(centerX - 9, centerY, centerX - 3, centerY);
    this.crosshair.lineBetween(centerX + 3, centerY, centerX + 9, centerY);
    this.crosshair.lineBetween(centerX, centerY - 9, centerX, centerY - 3);
    this.crosshair.lineBetween(centerX, centerY + 3, centerX, centerY + 9);
  }

  update(_time, delta) {
    const elapsed = Math.min(delta / 1000, 0.05);
    const turn =
      Number(this.cursors.left.isDown || this.wasd.A.isDown) -
      Number(this.cursors.right.isDown || this.wasd.D.isDown);
    const forward =
      Number(this.cursors.up.isDown || this.wasd.W.isDown) -
      Number(this.cursors.down.isDown || this.wasd.S.isDown);

    this.playerYaw += turn * TURN_SPEED * elapsed;

    if (forward !== 0) {
      const distance = forward * MOVE_SPEED * elapsed;
      const nextX = this.playerPosition.x - Math.sin(this.playerYaw) * distance;
      const nextZ = this.playerPosition.z - Math.cos(this.playerYaw) * distance;

      if (this.canStandAt(nextX, this.playerPosition.z)) {
        this.playerPosition.x = nextX;
      }
      if (this.canStandAt(this.playerPosition.x, nextZ)) {
        this.playerPosition.z = nextZ;
      }
    }

    this.renderThreeScene();
  }

  canStandAt(x, z) {
    if (Math.abs(x) > WORLD_LIMIT || Math.abs(z) > WORLD_LIMIT) {
      return false;
    }

    return !this.obstacles.some(
      (obstacle) =>
        Math.abs(x - obstacle.x) < obstacle.halfWidth + PLAYER_RADIUS &&
        Math.abs(z - obstacle.z) < obstacle.halfDepth + PLAYER_RADIUS
    );
  }

  renderThreeScene() {
    this.camera.position.copy(this.playerPosition);
    this.camera.rotation.y = this.playerYaw;
    this.renderer.render(this.threeScene, this.camera);
  }

  resizeThreeRenderer() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "phaser-ui",
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,
  scene: [RoaminAroundScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  render: {
    antialias: true,
    transparent: true,
  },
});
