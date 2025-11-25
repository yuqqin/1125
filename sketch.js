// Frame-sequence animation implementation (drawn inside p5 canvas)
let frames = []; // array of p5.Image for each frame (0.png .. 7.png)
let framesLoaded = false;
let spritesheetFallback = null;
let frameCount = 0;
let frameW = 0;
let frameH = 0;
let currentFrame = 0;
let frameDelay = 12; // frames to wait before advancing frame (增大數值會使播放變慢)
let frameTimer = 0;
// 最大顯示比例（相對於視窗），調大會放大畫面；1.0 表示可填滿整個視窗
let scaleMax = 1.0;
const candidateDirs = [
  '',
  '20251125/3/',
  '3/',
  'assets/',
  'images/'
];
const targetFrameFiles = 8; // 0..7

function preload() {
  // First try to load separate frame files (0.png..7.png) from candidate dirs
  tryLoadFrameDir(0);
}

function tryLoadFrameDir(dirIndex) {
  if (dirIndex >= candidateDirs.length) {
    // fallback: try loading a single spritesheet image (previous behavior)
    tryLoadSpritesheet(0);
    return;
  }

  const dir = candidateDirs[dirIndex];
  let movedToNext = false;
  let loadedCount = 0;
  frames = new Array(targetFrameFiles);

  for (let i = 0; i < targetFrameFiles; i++) {
    const path = dir + i + '.png';
    loadImage(
      path,
      (img) => {
        frames[i] = img;
        loadedCount++;
        // when first frame loads, record dimensions
        if (i === 0) {
          frameW = img.width;
          frameH = img.height;
        }
        if (loadedCount === targetFrameFiles && !movedToNext) {
          framesLoaded = true;
          frameCount = targetFrameFiles;
          console.log('Loaded frame sequence from', dir);
        }
      },
      () => {
        if (!movedToNext) {
          movedToNext = true;
          console.warn('Frame sequence not complete in', dir, '- trying next directory');
          tryLoadFrameDir(dirIndex + 1);
        }
      }
    );
  }
}

function tryLoadSpritesheet(index) {
  const candidatePaths = [
    'breath.png',
    '20251125/3/breath.png',
    '3/breath.png',
    'assets/breath.png',
    'images/breath.png'
  ];
  if (index >= candidatePaths.length) {
    console.warn('所有候選路徑皆無法載入 spritesheet 或 frame sequence');
    return;
  }

  const path = candidatePaths[index];
  loadImage(
    path,
    (img) => {
      spritesheetFallback = img;
      // treat as single-frame spritesheet
      frameCount = 1;
      frameW = img.width;
      frameH = img.height;
      framesLoaded = true; // allow drawing (single frame)
      console.log('Loaded fallback spritesheet from', path);
    },
    () => {
      console.warn('Failed to load', path, '; trying next');
      tryLoadSpritesheet(index + 1);
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
}

function draw() {
  background('#C2C2C2');

  if (framesLoaded) {
    // determine which image to draw: sequence frames preferred, else fallback single image
    if (frames && frames.length === frameCount && frames[0]) {
      const img = frames[currentFrame];
      drawFrameImage(img);
    } else if (spritesheetFallback) {
      drawFrameImage(spritesheetFallback);
    } else {
      // nothing valid
      push();
      fill(80);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text('無可用的影格資源', width / 2, height / 2);
      pop();
    }

    // advance frame if multiple
    if (frameCount > 1) {
      frameTimer++;
      if (frameTimer >= frameDelay) {
        frameTimer = 0;
        currentFrame = (currentFrame + 1) % frameCount;
      }
    }
  } else {
    push();
    fill(80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('載入中...', width / 2, height / 2);
    pop();
  }
}

function drawFrameImage(img) {
  if (!img) return;
  // scale to fit max percentage of viewport (controlled by `scaleMax`)
  const maxW = width * scaleMax;
  const maxH = height * scaleMax;
  const s = Math.min(maxW / img.width, maxH / img.height, 1);
  const dw = img.width * s;
  const dh = img.height * s;
  image(img, width / 2, height / 2, dw, dh);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
