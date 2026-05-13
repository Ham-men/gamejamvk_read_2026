const SpriteRenderer = {
  ctx: null,
  canvas: null,
  activeSprites: [],
  rainParticles: [],
  images: {},
  imagesLoaded: false,
  imageLoadAttempted: false,
  spritePlacementCounter: 0,

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

  keywordReplacements: {
    1: {
      "Наташа": "files/1Наташа.svg",
      "дочь": "files/1Наташа.svg",
      "отец": "files/3отец.svg",
      "мать": "files/2мама.svg",
      "сестрами": { src: "files/1Наташа.svg", count: 2 },
      "воротами": "files/4ворота.svg",
      "подружками": "files/1Наташа.svg",
      "девица": "files/1Наташа.svg",
      "тройка": { src: "files/5собака.svg", count: 3 },
      "молодцом": "files/3отец.svg"
    },
    2: {
      "Олег": "files/6король.svg",
      "хазарам": "files/7хазар.svg",
      "князь": "files/6король.svg",
      "коне": "files/5собака.svg",
      "леса": "files/8дерево.svg",
      "кудесник": "files/10кудесник.svg",
      "старик": "files/9старик.svg",
      "Перуну": "files/11перун.svg",
      "старец": "files/9старик.svg",
      "богов": "files/11перун.svg"
    },
    3: {
      "царь": "files/6король.svg",
      "Дадон": "files/6король.svg",
      "соседям": "files/12соседи.svg",
      "соседи": "files/12соседи.svg",
      "рать": "files/13армия.svg",
      "Воеводы": "files/11перун.svg",
      "юга": "files/14юг.svg"
    },
    4: {
      "лесу": "files/8дерево.svg",
      "медведиха": "files/15медведь.svg",
      "медвежатами": { src: "files/16медвежат.svg", count: 3 },
      "березою": "files/8дерево.svg",
      "медвежата": { src: "files/16медвежат.svg", count: 3 },
      "играть": "files/17мяч.svg",
      "мужик": "files/3отец.svg",
      "рогатину": "files/18тарелка.svg",
      "нож": "files/18тарелка.svg",
      "мешок": "files/19рюкзак.svg"
    },
    5: {
      "поп": "files/3отец.svg",
      "базару": "files/4ворота.svg",
      "Балда": "files/11перун.svg",
      "работник": "files/7хазар.svg",
      "конюх": "files/5собака.svg",
      "лбу": "files/20лоб.svg",
      "лоб": "files/20лоб.svg",
      "полбу": "files/20лоб.svg"
    },
    6: {
      "старик": "files/11перун.svg",
      "старухой": "files/21старуха.svg",
      "моря": "files/14юг.svg",
      "землянке": "files/22землянка.svg",
      "рыбу": "files/23рыба.svg",
      "Старуха": "files/21старуха.svg",
      "море": "files/14юг.svg",
      "невод": "files/14юг.svg",
      "тиной": { src: "files/24броколи.svg", count: 3, animation: "move_to_sea" },
      "травой": { src: "files/24броколи.svg", count: 3, animation: "move_to_center" },
      "рыбкой": "files/23рыба.svg",
      "золотою": "files/23рыба.svg",
      "рыбка": "files/23рыба.svg",
      "старче": "files/11перун.svg"
    },
    7: {
      "дуб": "files/8дерево.svg",
      "кот": "files/25кот.svg",
      "леший": "files/26леший.svg",
      "Русалка": "files/1Наташа.svg",
      "зверей": { src: "files/16медвежат.svg", count: 3 },
      "Избушка": "files/4ворота.svg",
      "ножках": { src: "files/27носок.svg", count: 2, animation: "under_hut" },
      "лес": "files/8дерево.svg",
      "волны": "files/14юг.svg",
      "берег": "files/14юг.svg",
      "витязей": { src: "files/28парень.svg", count: 3 }
    },
    8: {
      "Чик": "files/16медвежат.svg",
      "Тишиниус": "files/26леший.svg",
      "остров": "files/14юг.svg",
      "теремок": "files/4ворота.svg",
      "деревня": { src: "files/4ворота.svg", count: 3 },
      "речку": "files/14юг.svg",
      "дождик": { src: "files/29капля.svg", animation: "rain" },
      "мост": "files/4ворота.svg",
      "пещера": "files/30пещера.svg",
      "нотка": "files/16медвежат.svg",
      "кристаллы": "files/29капля.svg",
      "музыка": "files/31музыка.svg"
    }
  },

  getAllImagePaths() {
    const paths = [];
    const seen = new Set();
    Object.values(this.keywordReplacements).forEach(book => {
      Object.values(book).forEach(val => {
        let src = null;
        if (typeof val === 'string') src = val;
        else if (val && val.src) src = val.src;
        if (src && !seen.has(src)) {
          seen.add(src);
          paths.push(src);
        }
      });
    });
    return paths;
  },

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
    this.preloadImages();
  },

  preloadImages() {
    if (this.imageLoadAttempted) return;
    this.imageLoadAttempted = true;
    const paths = this.getAllImagePaths();
    let loaded = 0;
    const total = paths.length;

    if (total === 0) {
      this.imagesLoaded = true;
      return;
    }

    paths.forEach(path => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded >= total) this.imagesLoaded = true;
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total) this.imagesLoaded = true;
      };
      img.src = path;
      this.images[path] = img;
    });
  },

  getImageInfo(spriteName, keyword, bookId) {
    if (!bookId) return null;
    const bookRep = this.keywordReplacements[bookId];
    if (!bookRep || !keyword) return null;
    const val = bookRep[keyword];
    if (!val) return null;
    if (typeof val === 'string') {
      return { src: val, count: 1, animation: 'normal' };
    }
    return {
      src: val.src,
      count: val.count || 1,
      animation: val.animation || 'normal'
    };
  },

  spawnAtGround(spriteName, keyword, book) {
    if (!this.canvas || !this.ctx) return;

    const bookId = book ? book.id : null;
    const imgInfo = this.getImageInfo(spriteName, keyword, bookId);

    if (imgInfo && imgInfo.animation === 'rain') {
      this.startRain(this.images[imgInfo.src], imgInfo.src);
      return;
    }

    if (imgInfo && imgInfo.animation === 'under_hut') {
      this.spawnLegsUnderHut(spriteName, imgInfo);
      return;
    }

    if (imgInfo && (imgInfo.animation === 'move_to_sea' || imgInfo.animation === 'move_to_center')) {
      this.spawnMovingObjects(spriteName, imgInfo);
      return;
    }

    if (imgInfo && this.images[imgInfo.src]) {
      const count = imgInfo.count || 1;
      if (count === 1 && imgInfo.animation === 'normal') {
        if (this.activeSprites.find(s => s.name === spriteName && (s.state === 'active' || s.state === 'spawning'))) {
          return;
        }
      }
      for (let i = 0; i < count; i++) {
        this.spawnImageSprite(spriteName, imgInfo.src, count, i);
      }
      return;
    }

    this.spawnEmojiSprite(spriteName);
  },

  maxSafeX() {
    var panelW = this.canvas.width < 600 ? 340 : 450;
    return Math.max(this.canvas.width * 0.4, this.canvas.width - panelW);
  },

  spawnImageSprite(spriteName, src, totalCount, index) {
    const img = this.images[src];
    if (!img) {
      this.spawnEmojiSprite(spriteName);
      return;
    }

    var placement = this.spritePlacementCounter;
    this.spritePlacementCounter++;
    var baseX = 150;
    var maxX = this.maxSafeX();

    let x, y;
    if (totalCount > 1) {
      const spread = 45;
      const rowBreak = 4;
      const col = index % rowBreak;
      const row = Math.floor(index / rowBreak);
      x = Math.min(baseX + (placement * 15) + (col * spread), maxX);
      y = (this.canvas.height - 280) - 50 - (row * 60);
    } else {
      x = Math.min(baseX + (placement * 55), maxX);
      y = (this.canvas.height - 280) - 50;
    }

    const sprite = {
      type: 'image',
      name: spriteName,
      img: img,
      src: src,
      x: x,
      y: y,
      targetX: x,
      targetY: y,
      startX: x + 150,
      startY: y,
      opacity: 0,
      scale: 0.3,
      targetScale: 1,
      state: 'spawning',
      spawnTime: Date.now(),
      imgW: img.naturalWidth || 100,
      imgH: img.naturalHeight || 100
    };

    this.activeSprites.push(sprite);
  },

  spawnEmojiSprite(spriteName) {
    if (this.activeSprites.find(s => s.name === spriteName && (s.state === 'active' || s.state === 'spawning'))) {
      return;
    }

    var placement = this.spritePlacementCounter;
    this.spritePlacementCounter++;
    var baseX = 120;
    var x = Math.min(baseX + (placement * 55), this.maxSafeX());
    const groundY = this.canvas.height - 280;
    const y = groundY - 50;

    const sprite = {
      type: 'emoji',
      name: spriteName,
      x: x,
      y: y,
      targetX: x,
      targetY: y,
      opacity: 0,
      scale: 0.3,
      targetScale: 1,
      state: 'spawning',
      spawnTime: Date.now()
    };

    this.activeSprites.push(sprite);
  },

  spawnLegsUnderHut(spriteName, imgInfo) {
    const img = this.images[imgInfo.src];
    if (!img) { this.spawnEmojiSprite(spriteName); return; }

    const hut = this.activeSprites.find(s =>
      (s.name === 'hut' || s.src === 'files/4ворота.svg') && s.state === 'active'
    );

    const centerX = hut ? hut.x : this.canvas.width * 0.5;
    const hutY = hut ? hut.y : (this.canvas.height - 280) - 50;

    for (let i = 0; i < (imgInfo.count || 2); i++) {
      const x = centerX - 30 + (i * 60);
      const y = hutY + 60;

      this.activeSprites.push({
        type: 'image',
        name: spriteName + '_leg_' + i,
        img: img,
        src: imgInfo.src,
        x: x, y: y,
        targetX: x, targetY: y,
        startX: x, startY: y - 50,
        opacity: 0, scale: 0.3, targetScale: 1,
        state: 'spawning', spawnTime: Date.now(),
        imgW: img.naturalWidth || 100, imgH: img.naturalHeight || 100
      });
    }
  },

  spawnMovingObjects(spriteName, imgInfo) {
    const img = this.images[imgInfo.src];
    if (!img) { this.spawnEmojiSprite(spriteName); return; }

    const isToSea = imgInfo.animation === 'move_to_sea';
    const sea = this.activeSprites.find(s =>
      s.src === 'files/14юг.svg' && s.state === 'active'
    );
    const targetX = isToSea && sea ? sea.x : this.canvas.width * 0.5;
    const targetY = isToSea && sea ? sea.y - 20 : (this.canvas.height - 280) - 90;

    for (let i = 0; i < (imgInfo.count || 3); i++) {
      const startX = 140 + (i * 40);
      const startY = (this.canvas.height - 280) - 50;

      this.activeSprites.push({
        type: 'image',
        name: spriteName + '_move_' + i,
        img: img,
        src: imgInfo.src,
        x: startX, y: startY,
        targetX: targetX, targetY: targetY,
        startX: startX, startY: startY,
        opacity: 0, scale: 0.3, targetScale: 1,
        state: 'spawning', spawnTime: Date.now(),
        moveToTarget: true,
        moveProgress: 0,
        imgW: img.naturalWidth || 100, imgH: img.naturalHeight || 100
      });
    }
  },

  startRain(img, src) {
    const count = 25;
    for (let i = 0; i < count; i++) {
      this.rainParticles.push({
        img: img,
        imgSrc: src,
        x: Math.random() * (this.canvas ? this.canvas.width : 800),
        y: -Math.random() * this.canvas.height - 50,
        speed: 2 + Math.random() * 3,
        sway: (Math.random() - 0.5) * 0.5,
        size: 0.3 + Math.random() * 0.3,
        opacity: 0.4 + Math.random() * 0.6
      });
    }
  },

  updateAnimations() {
    const now = Date.now();
    const spawnDuration = 400;
    const removeDuration = 500;

    this.activeSprites.forEach(sprite => {
      if (sprite.state === 'spawning') {
        const elapsed = now - sprite.spawnTime;
        const progress = Math.min(elapsed / spawnDuration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        sprite.opacity = ease;
        sprite.scale = 0.3 + (1 - 0.3) * ease;

        if (sprite.startX !== undefined) {
          sprite.x = sprite.startX + (sprite.targetX - sprite.startX) * ease;
        }
        if (sprite.startY !== undefined && !sprite.moveToTarget) {
          sprite.y = sprite.startY + (sprite.targetY - sprite.startY) * ease;
        }

        if (sprite.moveToTarget) {
          sprite.moveProgress = ease;
          const mx = sprite.startX + (sprite.targetX - sprite.startX) * sprite.moveProgress;
          const my = sprite.startY + (sprite.targetY - sprite.startY) * sprite.moveProgress;
          sprite.x = mx;
          sprite.y = my;
        }

        if (progress >= 1) {
          sprite.state = 'active';
          sprite.opacity = 1;
          sprite.scale = 1;
          sprite.x = sprite.targetX;
          sprite.y = sprite.targetY;
        }
      } else if (sprite.state === 'removing') {
        const elapsed = now - sprite.removeTime;
        const progress = Math.min(elapsed / removeDuration, 1);
        sprite.x += 16;
        sprite.opacity = 1 - progress;
        sprite.scale = 1 - progress * 0.5;
        if (progress >= 1) {
          sprite.state = 'removed';
        }
      }
    });

    this.activeSprites = this.activeSprites.filter(s => s.state !== 'removed');

    for (let i = this.rainParticles.length - 1; i >= 0; i--) {
      const p = this.rainParticles[i];
      p.y += p.speed;
      p.x += p.sway;
      if (p.y > (this.canvas ? this.canvas.height : 600) + 50) {
        p.y = -50;
        p.x = Math.random() * (this.canvas ? this.canvas.width : 800);
      }
    }
  },

  clearSprites() {
    const now = Date.now();
    this.activeSprites.forEach(sprite => {
      if (sprite.state === 'active' || sprite.state === 'spawning') {
        sprite.state = 'removing';
        sprite.removeTime = now;
      }
    });
    this.rainParticles = [];
    this.spritePlacementCounter = 0;
  },

  redrawAll() {
    if (!this.ctx || !this.canvas) return;
    this.updateAnimations();

    this.rainParticles.forEach(p => {
      if (!p.img) return;
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      const dispSize = 30 * p.size;
      const aspect = p.img.naturalWidth / p.img.naturalHeight || 1;
      const w = dispSize * aspect;
      const h = dispSize;
      this.ctx.drawImage(p.img, p.x - w / 2, p.y - h / 2, w, h);
      this.ctx.restore();
    });

    this.activeSprites.forEach(sprite => {
      if (sprite.state === 'removed') return;

      this.ctx.save();
      this.ctx.globalAlpha = sprite.opacity;

      if (sprite.type === 'image' && sprite.img) {
        const baseSize = 80;
        const aspect = sprite.imgW / sprite.imgH || 1;
        const dispW = baseSize * aspect * sprite.scale;
        const dispH = baseSize * sprite.scale;
        this.ctx.drawImage(sprite.img, sprite.x - dispW / 2, sprite.y - dispH / 2, dispW, dispH);
      } else {
        const emoji = this.spriteMap[sprite.name];
        if (!emoji) { this.ctx.restore(); return; }
        this.ctx.font = Math.floor(60 * sprite.scale) + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, sprite.x, sprite.y);
      }

      this.ctx.restore();
    });
  },

  drawBlowingEffect(type, strength, time) {
    if (!this.ctx || !this.canvas) return;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var groundY = this.canvas.height - 280;

    if (type === 'fade_fog') {
      var fogAlpha = (1 - strength) * 0.5;
      for (var fi = 0; fi < 40; fi++) {
        var fx = ((fi * 137 + time * 0.02) % (w + 200)) - 100;
        var fy = ((fi * 89 + time * 0.015) % (h + 100)) - 50;
        var fw = 120 + Math.sin(fi * 2.7 + time * 0.003) * 40;
        this.ctx.beginPath();
        this.ctx.ellipse(fx, fy, fw, fw * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(200, 200, 210, ' + fogAlpha * (0.4 + Math.sin(fi + time * 0.001) * 0.3) + ')';
        this.ctx.fill();
      }
    } else if (type === 'fire_grow') {
      var flameH = 10 + strength * 110;
      var cx = w * 0.5, cy = groundY;
      var sparks = Math.floor(strength * 15);
      this.ctx.save();
      for (var fi = 0; fi < 5; fi++) {
        var fh = flameH * (0.6 + Math.sin(time * 0.01 + fi * 1.8) * 0.4);
        var fw = 20 + strength * 30;
        var fx = cx - fw + (fi / 4) * fw * 2;
        var grad = this.ctx.createRadialGradient(fx, cy - fh * 0.5, 0, fx, cy - fh * 0.5, fh);
        grad.addColorStop(0, 'rgba(255, 255, 200, ' + (0.9 * strength) + ')');
        grad.addColorStop(0.3, 'rgba(255, 200, 50, ' + (0.8 * strength) + ')');
        grad.addColorStop(0.7, 'rgba(255, 100, 20, ' + (0.6 * strength) + ')');
        grad.addColorStop(1, 'rgba(200, 50, 0, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.ellipse(fx, cy - fh * 0.3, fw * 0.3, fh * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      for (var si = 0; si < sparks; si++) {
        var sx = cx + Math.sin(si * 4.7 + time * 0.02) * strength * 60;
        var sy = cy - Math.random() * flameH * 0.8;
        var ss = 1 + Math.random() * 3;
        this.ctx.fillStyle = 'rgba(255, 200, 50, ' + (strength * (0.3 + Math.random() * 0.5)) + ')';
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    } else if (type === 'waves_intensity') {
      var waveAmp = 5 + strength * 40;
      var waveFreq = 0.02 + strength * 0.01;
      var waveSpeed = 0.002 + strength * 0.003;
      var seaY = groundY;
      this.ctx.save();
      for (var wi = 0; wi < 3; wi++) {
        var wa = waveAmp * (1 - wi * 0.2);
        var wy = seaY - 5 + wi * 8;
        this.ctx.beginPath();
        this.ctx.moveTo(0, wy);
        for (var wx = 0; wx <= w; wx += 4) {
          var wy2 = wy + Math.sin(wx * waveFreq + time * waveSpeed + wi * 2) * wa;
          this.ctx.lineTo(wx, wy2);
        }
        this.ctx.lineTo(w, h);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(30, 150, 220, ' + (0.2 + strength * 0.2 - wi * 0.05) + ')';
        this.ctx.fill();
      }
      if (strength > 0.6) {
        for (var fi = 0; fi < Math.floor(strength * 8); fi++) {
          var fx = ((fi * 197 + time * 0.01) % (w + 50)) - 25;
          var fy = seaY - 5 + Math.sin(fx * waveFreq + time * waveSpeed) * waveAmp;
          this.ctx.fillStyle = 'rgba(255, 255, 255, ' + (strength * 0.4) + ')';
          this.ctx.beginPath();
          this.ctx.ellipse(fx, fy, 8 + Math.random() * 6, 3, 0.3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.restore();
    } else if (type === 'tree_sway') {
      var angle = strength * 6;
      var lx = w * 0.5, ly = groundY;
      this.ctx.save();
      this.ctx.translate(lx, ly);
      this.ctx.rotate(angle * Math.PI / 180);
      this.ctx.strokeStyle = '#5D4037';
      this.ctx.lineWidth = 8;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, -100 - strength * 20);
      this.ctx.stroke();
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.beginPath();
      this.ctx.arc(0, -110 - strength * 20, 30 + strength * 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(20, -100 - strength * 20, 25 + strength * 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(-15, -95 - strength * 20, 22 + strength * 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      if (strength > 0.3) {
        var leafCount = Math.floor(strength * 10);
        for (var li = 0; li < leafCount; li++) {
          var lx2 = w * 0.5 + Math.sin(li * 5.3 + time * 0.01) * (100 + strength * 80);
          var ly2 = groundY - 50 - Math.random() * 80;
          this.ctx.fillStyle = 'rgba(76, 175, 80, ' + (strength * 0.5) + ')';
          this.ctx.beginPath();
          this.ctx.ellipse(lx2, ly2, 6, 3, strength * 0.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    } else if (type === 'flag_wave') {
      var poleX = w * 0.5, poleY = groundY;
      var flagLen = 50 + strength * 60;
      var flagW = 25 + strength * 15;
      this.ctx.save();
      this.ctx.strokeStyle = '#795548';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(poleX, poleY);
      this.ctx.lineTo(poleX, poleY - 120);
      this.ctx.stroke();
      var flagStartY = poleY - 100;
      this.ctx.beginPath();
      this.ctx.moveTo(poleX, flagStartY);
      for (var fx2 = 0; fx2 <= flagLen; fx2 += 3) {
        var fy2 = flagStartY + Math.sin(fx2 * 0.08 + time * 0.008 * strength) * flagW * 0.3;
        this.ctx.lineTo(poleX + fx2, fy2);
      }
      for (var fx2 = flagLen; fx2 >= 0; fx2 -= 3) {
        var fy2 = flagStartY + flagW + Math.sin(fx2 * 0.08 + time * 0.008 * strength + 0.5) * flagW * 0.3;
        this.ctx.lineTo(poleX + fx2, fy2);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = 'rgba(244, 67, 54, ' + (0.6 + strength * 0.4) + ')';
      this.ctx.fill();
      this.ctx.restore();
    } else if (type === 'wind_field') {
      var grassCount = 20;
      this.ctx.save();
      for (var gi = 0; gi < grassCount; gi++) {
        var gx2 = (gi / grassCount) * w;
        var gy2 = groundY;
        var bend = strength * 20 * Math.sin(gi * 1.3 + time * 0.005);
        this.ctx.strokeStyle = 'rgba(76, 175, 80, ' + (0.4 + strength * 0.4) + ')';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(gx2, gy2);
        this.ctx.quadraticCurveTo(gx2 + bend, gy2 - 20 - strength * 20, gx2 + bend * 1.5, gy2 - 30 - strength * 30);
        this.ctx.stroke();
      }
      this.ctx.restore();
    } else if (type === 'boat_sail') {
      var bx = w * 0.3 + (time * 0.02 * strength) % (w * 0.5);
      var by = groundY - 15;
      this.ctx.save();
      this.ctx.fillStyle = '#795548';
      this.ctx.beginPath();
      this.ctx.moveTo(bx - 25, by);
      this.ctx.lineTo(bx + 25, by);
      this.ctx.lineTo(bx + 15, by + 20);
      this.ctx.lineTo(bx - 15, by + 20);
      this.ctx.closePath();
      this.ctx.fill();
      var sailW = 15 + strength * 15;
      this.ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.7 + strength * 0.3) + ')';
      this.ctx.beginPath();
      this.ctx.moveTo(bx + 5, by);
      this.ctx.lineTo(bx + 5 + sailW, by - 25);
      this.ctx.lineTo(bx + 5, by - 25);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
  }
};
