(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let state = {
        currentLevel: null,
        unlockedLevels: [0],
        completedLevels: [],
        levelStars: {},
        selectedLevel: null,
        selectedBook: null
    };

    function loadState() {
        try {
            const raw = localStorage.getItem('island_save_v2');
            if (raw) state = { ...state, ...JSON.parse(raw) };
        } catch (e) {}
    }
    function saveState() {
        try { localStorage.setItem('island_save_v2', JSON.stringify(state)); } catch (e) {}
    }
    loadState();

    const character = {
        x: 60, groundY: 0, width: 30, height: 50,
        speed: 80, walking: false, walkFrame: 0, stopped: false
    };

    let gameActive = false;
    let currentBookParts = [];
    let currentPartIndex = 0;
    let totalPartsInBook = 0;
    let completedPartsInBook = 0;

    const menuOverlay = document.getElementById('menu-overlay');
    const levelGrid = document.getElementById('level-grid');
    const bookOverlay = document.getElementById('book-overlay');
    const bookGrid = document.getElementById('book-grid');
    const chik = document.getElementById('chik');
    const chikText = document.getElementById('chik-text');
    const hudLevelTitle = document.getElementById('level-title');
    const progressFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const btnStop = document.getElementById('btn-stop');
    const sidePanel = document.getElementById('side-panel');
    const panelTitle = document.getElementById('panel-title');
    const panelInstruction = document.getElementById('panel-instruction');
    const readingSection = document.getElementById('reading-section');
    const singingSection = document.getElementById('singing-section');
    const panelClose = document.getElementById('panel-close');
    const startBtn = document.getElementById('reading-start');
    const stopBtn = document.getElementById('reading-stop');
    const statusEl = document.getElementById('reading-status');
    const textArea = document.getElementById('reading-text-area');
    const singingStartBtn = document.getElementById('singing-start');
    const singingStopBtn = document.getElementById('singing-stop');

    let selectedBookId = null;
    let clouds = [];

    function showMenu() {
        gameActive = false;
        closeSidePanel();
        menuOverlay.classList.remove('hidden');
        if (bookOverlay) bookOverlay.classList.add('hidden');
        chik.classList.add('hidden');
        hudLevelTitle.style.display = 'none';
        btnStop.style.display = 'none';
        renderMenu();
    }

    function renderMenu() {
        levelGrid.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = '<div class="level-num">📖</div><div class="level-name">Чтение сказок</div>';
        card.addEventListener('click', () => {
            document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
        levelGrid.appendChild(card);

        const startDiv = document.createElement('div');
        startDiv.style.gridColumn = '1 / -1';
        startDiv.style.marginTop = '8px';
        startDiv.innerHTML = '<button id="menu-start-btn" class="btn-primary" style="width:100%;font-size:18px;padding:14px 28px">▶ Начать</button>';
        levelGrid.appendChild(startDiv);

        setTimeout(() => {
            const btn = document.getElementById('menu-start-btn');
            if (btn) btn.addEventListener('click', () => showBookSelection());
        }, 100);
    }

    function showBookSelection() {
        menuOverlay.classList.add('hidden');
        if (!bookOverlay) return;
        bookOverlay.classList.remove('hidden');
        bookGrid.innerHTML = '';
        BOOKS_DATA.forEach(book => {
            const card = document.createElement('div');
            card.className = 'level-card';
            card.innerHTML = `<div class="level-num">📖</div><div class="level-name">${book.title}</div>`;
            card.addEventListener('click', () => {
                bookGrid.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedBookId = book.id;
            });
            bookGrid.appendChild(card);
        });

        document.getElementById('book-start').onclick = () => {
            if (selectedBookId !== null) {
                const book = BOOKS_DATA.find(b => b.id === selectedBookId);
                if (book) startBookLevel(book);
            } else {
                alert('Пожалуйста, выберите сказку!');
            }
        };

        document.getElementById('book-skip').onclick = () => {
            if (BOOKS_DATA.length > 0) startBookLevel(BOOKS_DATA[0]);
        };
    }

    function startBookLevel(book) {
        state.selectedBook = book;
        if (bookOverlay) bookOverlay.classList.add('hidden');
        menuOverlay.classList.add('hidden');

        gameActive = true;
        currentBookParts = book.parts || [];
        currentPartIndex = 0;
        totalPartsInBook = currentBookParts.length;
        completedPartsInBook = 0;

        if (SpriteRenderer && SpriteRenderer.init) {
            SpriteRenderer.init('gameCanvas');
        }
        character.groundY = canvas.height - 160;
        character.x = 60;
        character.walking = true;
        character.stopped = false;

        hudLevelTitle.textContent = '📖 ' + book.title;
        hudLevelTitle.style.display = 'block';
        btnStop.style.display = 'block';
        chik.classList.remove('hidden');

        clouds = [];
        for (let i = 0; i < 4; i++) {
            clouds.push({
                x: Math.random() * canvas.width,
                y: 40 + Math.random() * 80,
                w: 60 + Math.random() * 50,
                speed: 0.2 + Math.random() * 0.3
            });
        }

        updateProgress();
        showChik('Начинаем: ' + book.title);
        setTimeout(() => showNextPart(), 1500);
    }

    function updateProgress() {
        const pct = totalPartsInBook > 0 ? Math.round((completedPartsInBook / totalPartsInBook) * 100) : 0;
        progressFill.style.width = pct + '%';
        progressText.textContent = pct + '%';
    }

    function showNextPart() {
        if (currentPartIndex >= currentBookParts.length) {
            completeLevel();
            return;
        }

        const part = currentBookParts[currentPartIndex];
        character.walking = false;
        character.stopped = true;

        if (SpriteRenderer && SpriteRenderer.clearSprites) {
            SpriteRenderer.clearSprites();
        }

        // Play transition sound when starting a new part
        try {
            const audio = new Audio('sound.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch(e) {}

        if (part.type === 'reading') {
            openSidePanelForReading(part);
        } else if (part.type === 'singing') {
            openSidePanelForSinging(part);
        }
    }

    function openSidePanelForReading(part) {
        panelTitle.textContent = 'Чтение';
        panelInstruction.textContent = 'Прочитай текст вслух. При упоминании ключевых слов на сцене появятся объекты!';
        readingSection.classList.remove('hidden');
        singingSection.classList.add('hidden');
        sidePanel.classList.remove('closed');
        sidePanel.classList.add('open');

        const text = part.text || '';
        const triggers = part.triggers || [];

        if (window.readingModule && window.readingModule.setText) {
            window.readingModule.setText(text);
        }

        statusEl.textContent = 'Нажми «Начать» и читай!';
        statusEl.className = '';
        startBtn.disabled = false;

        let caughtTriggers = new Set();

        startBtn.onclick = () => {
            startBtn.disabled = true;
            statusEl.textContent = 'Говори...';

            if (window.readingModule && window.readingModule.startReading) {
                window.readingModule.startReading(
                    triggers,
                    (kw) => {
                        if (!caughtTriggers.has(kw)) {
                            caughtTriggers.add(kw);
                            statusEl.textContent = '«' + kw + '» — появляется на сцене!';

                            if (state.selectedBook && state.selectedBook.triggerSprites) {
                                const spriteName = state.selectedBook.triggerSprites[kw.toLowerCase()];
                                if (spriteName) {
                                    if (SpriteRenderer && SpriteRenderer.spawnAtGround) {
                                        SpriteRenderer.spawnAtGround(spriteName);
                                    }
                                }
                            }
                        }
                    },
                    state.selectedBook
                );
            }
        };

        stopBtn.onclick = () => {
            if (window.readingModule) window.readingModule.stopReading();
            closeSidePanel();
            partCompleted();
        };

        if (window.readingModule && window.readingModule.setPartCompleteCallback) {
            window.readingModule.setPartCompleteCallback(() => {
                setTimeout(() => {
                    if (window.readingModule) window.readingModule.stopReading();
                    closeSidePanel();
                    partCompleted();
                }, 1500);
            });
        }
    }

    function openSidePanelForSinging(part) {
        panelTitle.textContent = part.title || 'Пение';
        panelInstruction.textContent = part.instruction || 'Спой ноту в микрофон';
        singingSection.classList.remove('hidden');
        readingSection.classList.add('hidden');
        sidePanel.classList.remove('closed');
        sidePanel.classList.add('open');

        singingStartBtn.disabled = false;
        const notes = part.notes || [];

        if (part.chikBefore) {
            showChik(part.chikBefore);
        }

        singingStartBtn.onclick = () => {
            singingStartBtn.disabled = true;

            if (window.singingModule && window.singingModule.startSinging) {
                window.singingModule.startSinging(notes, () => {
                    if (part.chikAfter) {
                        showChik(part.chikAfter);
                    }
                    setTimeout(() => {
                        if (window.singingModule) window.singingModule.stopSinging();
                        closeSidePanel();
                        partCompleted();
                    }, 1500);
                });
            }
        };

        singingStopBtn.onclick = () => {
            if (window.singingModule) window.singingModule.stopSinging();
            closeSidePanel();
            partCompleted();
        };
    }

    function playTransitionSound() {
        try {
            const audio = new Audio('sound.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch(e) {}
    }

    function partCompleted() {
        completedPartsInBook++;
        updateProgress();
        currentPartIndex++;
        character.walking = true;
        character.stopped = false;
        showChik('Молодец! Идём дальше...');
        playTransitionSound();
        setTimeout(() => showNextPart(), 2000);
    }

    function completeLevel() {
        gameActive = false;
        showChik('Сказка закончена! Молодец! 🎉');
        try {
            const audio = new Audio('sound.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch(e) {}
        setTimeout(() => showBookSelection(), 3000);
    }

    function closeSidePanel() {
        sidePanel.classList.remove('open');
        sidePanel.classList.add('closed');
    }

    panelClose.addEventListener('click', () => {
        if (window.readingModule) window.readingModule.stopReading();
        if (window.singingModule) window.singingModule.stopSinging();
        closeSidePanel();
        partCompleted();
    });

    function showChik(text) {
        chikText.textContent = text;
        chik.classList.remove('hidden');
    }

    btnStop.addEventListener('click', () => {
        if (confirm('Выйти в меню?')) {
            if (window.readingModule) window.readingModule.stopReading();
            if (window.singingModule) window.singingModule.stopSinging();
            showMenu();
        }
    });

    function drawCharacter(x, y, frame) {
        const w = character.width;
        const h = character.height;
        const legSwing = Math.sin(frame * 0.15) * 8;

        ctx.fillStyle = '#42A5F5';
        ctx.fillRect(x - w / 2, y - h, w, h * 0.6);

        ctx.fillStyle = '#FFCC80';
        ctx.beginPath();
        ctx.arc(x, y - h - 8, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - 4, y - h - 10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 4, y - h - 10, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y - h - 6, 5, 0.1, Math.PI - 0.1);
        ctx.stroke();

        ctx.strokeStyle = '#FFCC80';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y - h + 8);
        ctx.lineTo(x - w / 2 - 8, y - h + 18 + legSwing);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y - h + 8);
        ctx.lineTo(x + w / 2 + 8, y - h + 18 - legSwing);
        ctx.stroke();

        ctx.strokeStyle = '#1565C0';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - h * 0.4);
        ctx.lineTo(x - 5 + legSwing, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 5, y - h * 0.4);
        ctx.lineTo(x + 5 - legSwing, y);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - 5 + legSwing, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5 - legSwing, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawClouds() {
        clouds.forEach(c => {
            c.x += c.speed;
            if (c.x > canvas.width + 100) c.x = -100;
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, c.w / 2, c.w / 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(c.x + c.w * 0.3, c.y + 5, c.w / 3, c.w / 5, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    let lastTime = 0;

    function gameLoop(timestamp) {
        const dt = Math.min(timestamp - lastTime, 50);
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!gameActive) {
            drawMenuBackground();
        } else {
            drawGameBackground();
            updateCharacter(dt);
            drawClouds();
            if (SpriteRenderer && SpriteRenderer.redrawAll) {
                SpriteRenderer.redrawAll();
            }
            if (character.walking) character.walkFrame++;
            drawCharacter(character.x, character.groundY, character.walkFrame);
        }

        requestAnimationFrame(gameLoop);
    }

    function updateCharacter(dt) {
        if (!character.walking || character.stopped) return;
        const dtSec = dt / 1000;
        character.x += character.speed * dtSec;
        if (character.x > canvas.width * 0.35) {
            character.x = canvas.width * 0.35;
        }
    }

    function drawGameBackground() {
        const w = canvas.width;
        const h = canvas.height;
        const groundY = character.groundY;

        const bg = ctx.createLinearGradient(0, 0, 0, groundY);
        bg.addColorStop(0, '#B3E5FC');
        bg.addColorStop(1, '#E8F5E9');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, groundY);

        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(80, 80, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#81C784';
        ctx.fillRect(0, groundY, w, h - groundY);
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(0, groundY, w, 4);

        for (let i = 0; i < 12; i++) {
            const gx = ((i * 130 + Date.now() * 0.0003) % (w + 100)) - 50;
            ctx.fillStyle = '#66BB6A';
            ctx.beginPath();
            ctx.moveTo(gx, groundY);
            ctx.lineTo(gx + 4, groundY - 12);
            ctx.lineTo(gx + 8, groundY);
            ctx.fill();
        }
    }

    function drawMenuBackground() {
        const w = canvas.width, h = canvas.height;
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#B3E5FC');
        bg.addColorStop(1, '#81D4FA');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(w - 100, 80, 45, 0, Math.PI * 2);
        ctx.fill();

        const groundY = h * 0.75;
        ctx.fillStyle = '#81C784';
        ctx.fillRect(0, groundY, w, h - groundY);
    }

    requestAnimationFrame(gameLoop);
    showBookSelection();
})();
