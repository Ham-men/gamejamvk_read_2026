const SpriteRenderer = {
  ctx: null,
  canvas: null,
  activeSprites: [],
  animatingSprites: [], // For exit animations

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  },

  // Simple map: spriteName -> emoji
  spriteMap: {
    "girl": "👧", "girls": "👧", "old_man": "👴", "old_woman": "👵",
    "man": "👨", "men": "👨", "woman": "👩", "boy": "👦",
    "child": "👶", "family": "👨‍👩‍👧", "friends": "👩‍❤️‍👩",
    "groom": "🤵", "bride": "👰", "brother": "👨", "young_men": "💁",
    "prince": "🤴", "king": "🤴", "wizard": "🧙‍♂️", "god": "⚡",
    "gods": "⚡", "forest_spirit": "🌲", "mermaid": "🧜‍♀️", "knights": "🛡️",
    "horse": "🐎", "horses": "🐎", "bear": "🐻", "bear_cubs": "🐻",
    "cat": "🐈", "dog": "🐕", "fox": "🦊", "wolf": "🐺",
    "hare": "🐰", "fish": "🐟", "goldfish": "🐠", "bird": "🐦",
    "dove": "🕊", "rooster": "🐓", "chicken": "🐔", "bug": "🐞",
    "beasts": "🐗", "house": "🏠", "hut": "🛖", "castle": "🏰",
    "church": "⛪", "gate": "🚪", "door": "🚪", "table": "🪑",
    "stove": "🔥", "porch": "🏠", "tree": "🌳", "trees": "🌲",
    "forest": "🌲", "moon": "🌙", "clouds": "☁️", "sun": "☀️",
    "sea": "🌊", "waves": "🌊", "shore": "🏖️", "grass": "🌿",
    "seaweed": "🌿", "gold": "👑", "pearls": "💎", "ring": "💍",
    "knife": "🔪", "spear": "🔱", "net": "🕸️", "bag": "🎒",
    "pie": "🥧", "food": "🍽", "fur_coat": "🧥", "cloth": "🧵",
    "brocade": "🎀", "candle": "🕯️", "nest": "🪹", "feast": "🍽",
    "guests": "👥", "songs": "🎵", "play": "🎮", "market": "🏪",
    "worker": "👷", "priest": "⛪", "stableman": "🐎", "merchant": "💼",
    "boyar": "🤴", "villain": "😈", "court": "⚖️", "hand": "✋",
    "legs": "🦿", "forehead": "👃", "neighbors": "🏘", "army": "🛡️",
     "generals": "🎖️", "enemies": "😈", "south": "🧭", "bridge": "🌉"
   },

  spawnAtGround(spriteName) {
    if (!this.canvas || !this.ctx) return;
    
    // Check if this sprite already exists
    if (this.activeSprites.find(s => s.name === spriteName && s.state === 'active')) {
      console.log(`Sprite ${spriteName} already active`);
      return;
    }
    
    // Place sprite closer to character (around 42% width, spread horizontally)
    const spriteIndex = this.activeSprites.filter(s => s.state === 'active').length;
    const baseX = this.canvas.width * 0.42; // Moved from 0.65 to 0.42 (closer to character at 35%)
    const x = Math.min(baseX + (spriteIndex * 70), this.canvas.width * 0.75); // 70px apart, max 75%
    const groundY = this.canvas.height - 160;
    const y = groundY - 50;
    
    const sprite = {
      name: spriteName,
      x: x,
      y: y,
      targetX: x,
      targetY: y,
      opacity: 0,
      scale: 0.3,
      targetScale: 1,
      state: 'spawning', // spawning, active, removing
      spawnTime: Date.now()
    };
    
    this.activeSprites.push(sprite);
    console.log(`Spawned ${spriteName} at x:${x}, y:${y}. Active: ${this.activeSprites.length}`);
  },

  updateAnimations() {
    const now = Date.now();
    const spawnDuration = 400; // ms
    const removeDuration = 500; // ms
    const flySpeed = 8; // pixels per frame (will be multiplied by dt)
    
    // Update active sprites
    this.activeSprites.forEach(sprite => {
      if (sprite.state === 'spawning') {
        const elapsed = now - sprite.spawnTime;
        const progress = Math.min(elapsed / spawnDuration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        sprite.opacity = ease;
        sprite.scale = 0.3 + (1 - 0.3) * ease;
        if (progress >= 1) {
          sprite.state = 'active';
          sprite.opacity = 1;
          sprite.scale = 1;
        }
      } else if (sprite.state === 'removing') {
        // Fly to the right and fade out
        const elapsed = now - sprite.removeTime;
        const progress = Math.min(elapsed / removeDuration, 1);
        sprite.x += flySpeed * 2;
        sprite.opacity = 1 - progress;
        sprite.scale = 1 - progress * 0.5;
        if (progress >= 1) {
          sprite.state = 'removed';
        }
      }
    });
    
    // Remove sprites marked as 'removed'
    this.activeSprites = this.activeSprites.filter(s => s.state !== 'removed');
  },

  clearSprites() {
    // Animate sprites flying away instead of immediate clear
    const now = Date.now();
    this.activeSprites.forEach(sprite => {
      if (sprite.state === 'active' || sprite.state === 'spawning') {
        sprite.state = 'removing';
        sprite.removeTime = now;
      }
    });
    // Sprites will be removed in updateAnimations after animation completes
    console.log('Sprites clearing with animation');
  },

  redrawAll() {
    if (!this.ctx || !this.canvas) return;
    
    // Update animations first
    this.updateAnimations();
    
    // Redraw all active sprites with current opacity/scale
    this.activeSprites.forEach(sprite => {
      if (sprite.state === 'removed') return;
      const emoji = this.spriteMap[sprite.name];
      if (!emoji) return;
      
      this.ctx.save();
      this.ctx.globalAlpha = sprite.opacity;
      this.ctx.font = `${Math.floor(60 * sprite.scale)}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(emoji, sprite.x, sprite.y);
      this.ctx.restore();
    });
  }
};
