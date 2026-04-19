const SPRITE_COUNT = 10;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sprites = [];

const spriteAssets = {
  cows: {},
};
let canvasLogicalWidth = 0;
let canvasLogicalHeight = 0;

function getSpriteSize() {
  return window.innerWidth < 544 ? 60 : 120;
}

function setupThemeToggle() {
  const root = document.documentElement;
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) return;

  const modes = ['system', 'light', 'dark'];
  const savedMode = localStorage.getItem('themeMode') || 'system';
  let mode = modes.includes(savedMode) ? savedMode : 'system';

  function applyMode(nextMode) {
    mode = nextMode;
    if (mode === 'system') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = mode;
    }
    toggleButton.textContent = mode[0].toUpperCase() + mode.slice(1);
    localStorage.setItem('themeMode', mode);
  }

  applyMode(mode);

  toggleButton.addEventListener('click', () => {
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    applyMode(modes[nextIndex]);
  });
}

function setupHeaderMarkCycle() {
  const headerMark = document.querySelector('.header-mark');
  if (!headerMark) return;

  const markSources = ['logo.svg', 'sticker-1.webp', 'sticker-2.webp'];
  let currentIndex = 0;
  let isTransitioning = false;

  headerMark.addEventListener('pointerdown', () => {
    if (isTransitioning) return;
    isTransitioning = true;

    currentIndex = (currentIndex + 1) % markSources.length;
    const nextSource = markSources[currentIndex];
    let fallbackId = 0;

    const onTransitionEnd = (event) => {
      if (event.propertyName !== 'transform') return;
            finishSwap()
    };

    const finishSwap = () => {
      if (!isTransitioning) return;
      headerMark.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(fallbackId);
      headerMark.src = nextSource;
            setTimeout(() => {
                headerMark.classList.remove('is-click-hold');
                isTransitioning = false;
            }, 0);
    };

    headerMark.addEventListener('transitionend', onTransitionEnd);
        fallbackId = window.setTimeout(finishSwap, 260);
    requestAnimationFrame(() => {
      headerMark.classList.add('is-click-hold');
    });
  });
}

class Sprite {
  constructor() {
    this.size = getSpriteSize();
    this.x = Math.random() * canvasLogicalWidth;
    this.speed = 0.5 + Math.random() * 1.5;
    this.walkPhase = Math.random() * Math.PI * 2;
    this.walkSpeed = 0.05;
    this.walkBounce = 5;
    
    this.state = 'WALK';
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.targetDirection = this.direction;
    this.stateFrames = 0;
    this.stateFrameDuration = 0;
    this.flipProgress = 0;
    this.fadeInProgress = 0;
    this.fadeInSpeed = 0.025 + Math.random() * 0.02;
    this.fadeInDelayFrames = Math.floor(Math.random() * 24);
    this.image = null;
    this.setNewState();
  }
  
  setNewState() {
    if (this.state === 'WALK') {
      this.state = 'WAIT';
      this.stateFrames = 0;
      this.stateFrameDuration = 60 + Math.random() * 120;
    } else {
      this.state = 'WALK';
      this.stateFrames = 0;
      this.stateFrameDuration = 120 + Math.random() * 180;
      const newDirection = Math.random() < 0.5 ? 1 : -1;
      if (newDirection !== this.targetDirection) {
        this.targetDirection = newDirection;
        this.flipProgress = 0;
      }
    }
  }

  update() {
    this.stateFrames++;
    
    if (this.stateFrames >= this.stateFrameDuration) {
      this.setNewState();
    }
    
    if (this.flipProgress < 1) {
      this.flipProgress += 0.1;
      if (this.flipProgress >= 1) {
        this.flipProgress = 1;
        this.direction = this.targetDirection;
      }
    }

    if (this.fadeInDelayFrames > 0) {
      this.fadeInDelayFrames -= 1;
    } else if (this.fadeInProgress < 1) {
      this.fadeInProgress = Math.min(1, this.fadeInProgress + this.fadeInSpeed);
    }
    
    if (this.state === 'WALK') {
      this.x += this.speed * this.targetDirection;
    }
    
    const minX = this.size / 2;
    const maxX = canvasLogicalWidth - this.size / 2;
    if (this.x < minX) {
      this.x = minX;
      this.targetDirection = 1;
      this.flipProgress = 0;
    }
    if (this.x > maxX) {
      this.x = maxX;
      this.targetDirection = -1;
      this.flipProgress = 0;
    }
    
    this.walkPhase += this.walkSpeed;
  }

  getYPosition(canvasHeight) {
    const bounce = Math.sin(this.walkPhase) * this.walkBounce;
    return canvasHeight - this.size / 2 + bounce;
  }

  getScaleX() {
    if (this.flipProgress < 1) {
      const easeProgress = (1 - Math.cos(this.flipProgress * Math.PI)) / 2;
      return this.direction + (this.targetDirection - this.direction) * easeProgress;
    }
    return this.targetDirection;
  }

  draw(context, canvasHeight) {
    if (!this.image) return;

    const scaleX = this.getScaleX();
    const y = this.getYPosition(canvasHeight);
    const sourceInset = 1;
    const sourceWidth = Math.max(1, this.image.naturalWidth - sourceInset * 2);
    const sourceHeight = Math.max(1, this.image.naturalHeight - sourceInset * 2);

    context.save();
    context.globalAlpha = this.fadeInProgress;
    context.translate(this.x, y);
    context.scale(scaleX * -1, 1);
    context.drawImage(
      this.image,
      sourceInset,
      sourceInset,
      sourceWidth,
      sourceHeight,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size,
    );
    context.restore();
  }
}

function loadSpriteImage() {
  const cowSources = [
    'ikucow-blood.png',
    'ikucow-bm.png',
    'ikucow-carixo.png',
    'ikucow-j9.png',
    'ikucow-jole.png',
    'ikucow-kiwi.png',
    'ikucow-misi.png',
    'ikucow-of.png',
    'ikucow-txt.png',
    'ikucow-zuk.png',
  ];

  let loaded = 0;
  const total = cowSources.length;

  cowSources.forEach((source) => {
    const img = new Image();
    img.src = `./${source}`;
    img.onload = () => {
      spriteAssets.cows[source] = img;
      loaded += 1;
      if (loaded === total) {
        start();
      }
    };
  });
}

function animate() {
  ctx.clearRect(0, 0, canvasLogicalWidth, canvasLogicalHeight);

  sprites.forEach(sprite => {
    sprite.update();
    sprite.draw(ctx, canvasLogicalHeight);
  });
  requestAnimationFrame(animate);
}

function resizeCanvases() {
  const header = document.querySelector('header');
  if (!header) return;
  const rect = header.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const nextLogicalWidth = rect.width;
  const nextLogicalHeight = rect.height;

  canvasLogicalWidth = nextLogicalWidth;
  canvasLogicalHeight = nextLogicalHeight;

  canvas.width = Math.round(nextLogicalWidth * dpr);
  canvas.height = Math.round(nextLogicalHeight * dpr);
  canvas.style.width = `${nextLogicalWidth}px`;
  canvas.style.height = `${nextLogicalHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const nextSize = getSpriteSize();
  sprites.forEach((sprite) => {
    sprite.size = nextSize;
    const minX = sprite.size / 2;
    const maxX = canvasLogicalWidth - sprite.size / 2;
    sprite.x = Math.max(minX, Math.min(sprite.x, maxX));
  });
}
window.addEventListener('resize', () => {
  resizeCanvases();
});

function start() {
  resizeCanvases();

  sprites.length = 0;
  const cowImages = Object.values(spriteAssets.cows);
  if (cowImages.length === 0) return;

  for (let i = 0; i < SPRITE_COUNT; i++) {
    const sprite = new Sprite();
    sprite.image = cowImages[i % cowImages.length];
    sprites.push(sprite);
  }

  requestAnimationFrame(animate);
}
loadSpriteImage();
setupThemeToggle();
setupHeaderMarkCycle();