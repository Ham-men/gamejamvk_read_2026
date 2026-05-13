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
        x: 60, groundY: 0, width: 38, height: 60,
        speed: 80, walking: false, walkFrame: 0, stopped: false
    };

    let gameActive = false;
    let currentBookParts = [];
    let currentPartIndex = 0;
    let totalPartsInBook = 0;
    let completedPartsInBook = 0;

    const menuOverlay = document.getElementById('menu-overlay');
    const bookGrid = document.getElementById('book-grid');
    const chik = document.getElementById('chik');
    const chikText = document.getElementById('chik-text');
    const hudLevelTitle = document.getElementById('level-title');
    const progressFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const hudCoins = document.getElementById('hud-coins');
    const coinCount = document.getElementById('coin-count');
    const btnStop = document.getElementById('btn-stop');
    const btnCamera = document.getElementById('btn-camera');
    var cameraEnabled = false;
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
    const debugToggleBtn = document.getElementById('debug-toggle-btn');
    const debugPanel = document.getElementById('debug-panel');
    const debugText = document.getElementById('debug-text');
    const debugClear = document.getElementById('debug-clear');
    const blowingSection = document.getElementById('blowing-section');
    const blowingStatus = document.getElementById('blowing-status');
    const blowingStartBtn = document.getElementById('blowing-start');
    const blowingStopBtn = document.getElementById('blowing-stop');
    const blowSensitivity = document.getElementById('blow-sensitivity');
    const blowSensitivityVal = document.getElementById('blow-sensitivity-val');
    const blowMultiplier = document.getElementById('blow-multiplier');
    const blowMultiplierVal = document.getElementById('blow-multiplier-val');
    const blowMeterFill = document.getElementById('blow-meter-fill');
    const blowMeterVal = document.getElementById('blow-meter-val');
    const blowSimulate = document.getElementById('blow-simulate');
    const blowDebugToggle = document.getElementById('blow-debug-toggle');
    const blowingDebug = document.getElementById('blowing-debug');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarCoinCount = document.getElementById('avatar-coin-count');
    const completeOverlay = document.getElementById('level-complete-overlay');
    const completeTitle = document.getElementById('complete-title');
    const completeText = document.getElementById('complete-text');
    const completeMenuBtn = document.getElementById('complete-menu');
    const completeNextBtn = document.getElementById('complete-next');

    let selectedBookId = null;
    let debugVisible = false;
    let clouds = [];
    let currentBlowEffect = null;
    let blowDebugVisible = false;
    let blowingSectionActive = false;
    let finalBlowStrength = 0;

    function showMenu() {
        gameActive = false;
        closeSidePanel();
        if (window.cameraModule) {
            window.cameraModule.stopCamera();
        }
        cameraEnabled = false;
        btnCamera.classList.remove('camera-on');
        btnCamera.classList.add('camera-off');
        btnCamera.innerHTML = '📷 камера';
        menuOverlay.classList.remove('hidden');
        chik.classList.add('hidden');
        hudLevelTitle.style.display = 'none';
        btnStop.style.display = 'none';
        btnCamera.style.display = 'none';
        if (hudCoins) hudCoins.style.display = 'none';
        if (completeOverlay) completeOverlay.classList.add('hidden');
        renderMenu();
    }

    function renderMenu() {
        renderBookGrid();
        renderAvatarEditor();

        document.getElementById('book-start').onclick = () => {
            if (selectedBookId !== null) {
                const book = BOOKS_DATA.find(b => b.id === selectedBookId);
                if (book) startBookLevel(book);
            } else {
                alert('Пожалуйста, выберите сказку!');
            }
        };


    }

    function renderBookGrid() {
        bookGrid.innerHTML = '';
        BOOKS_DATA.forEach(book => {
            const card = document.createElement('div');
            card.className = 'level-card';
            var completedText = '';
            if (state.completedLevels && state.completedLevels.indexOf(book.id) !== -1) {
                completedText = '<div class="level-status complete">✅ Пройдено</div>';
            }
            card.innerHTML = '<div class="level-num">📖</div><div class="level-name">' + book.title + '</div>' + completedText;
            card.addEventListener('click', () => {
                bookGrid.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedBookId = book.id;
            });
            bookGrid.appendChild(card);
        });
    }

    function renderAvatarEditor() {
        if (!window.avatarModule) return;
        if (avatarCoinCount) avatarCoinCount.textContent = window.avatarModule.getCoins();

        var apCtx = avatarPreview.getContext('2d');
        apCtx.clearRect(0, 0, 160, 180);
        window.avatarModule.draw(apCtx, 80, 155, 20, 40, Date.now() / 1000);

        var slotsEl = document.getElementById('avatar-slots');
        if (!slotsEl) return;
        slotsEl.innerHTML = '';

        var items = window.avatarModule.getItems();
        var current = window.avatarModule.getCurrent();

        Object.keys(items).forEach(function(slotKey) {
            var slot = items[slotKey];
            var slotDiv = document.createElement('div');
            slotDiv.className = 'avatar-slot';

            var label = document.createElement('div');
            label.className = 'avatar-slot-label';
            label.textContent = slot.label;
            slotDiv.appendChild(label);

            var optionsDiv = document.createElement('div');
            optionsDiv.className = 'avatar-options';

            slot.options.forEach(function(opt) {
                var btn = document.createElement('button');
                btn.className = 'avatar-opt-btn';
                if (current[slotKey] === opt.id) btn.classList.add('selected');
                if (!window.avatarModule.isOwned(slotKey, opt.id) && opt.price > 0) btn.classList.add('locked');

                if (opt.price > 0) {
                    if (window.avatarModule.isOwned(slotKey, opt.id)) {
                        btn.innerHTML = opt.label + ' ✅';
                    } else {
                        btn.innerHTML = opt.label + ' <img src="files/32яйцо.svg" style="width:12px;height:12px;vertical-align:middle;">' + opt.price;
                    }
                } else {
                    btn.textContent = opt.label;
                }

                btn.addEventListener('click', function() {
                    if (window.avatarModule.isOwned(slotKey, opt.id)) {
                        window.avatarModule.select(slotKey, opt.id);
                        renderAvatarEditor();
                        return;
                    }
                    if (opt.price > 0) {
                        var ok = window.avatarModule.buy(slotKey, opt.id);
                        if (!ok) {
                            alert('Не хватает монет! Нужно: ' + opt.price);
                            return;
                        }
                        renderAvatarEditor();
                    }
                });

                optionsDiv.appendChild(btn);
            });

            slotDiv.appendChild(optionsDiv);
            slotsEl.appendChild(slotDiv);
        });
    }

    function startBookLevel(book) {
        state.selectedBook = book;
        menuOverlay.classList.add('hidden');

        gameActive = true;
        currentBookParts = book.parts || [];
        currentPartIndex = 0;
        totalPartsInBook = currentBookParts.length;
        completedPartsInBook = 0;

        if (SpriteRenderer && SpriteRenderer.init) {
            SpriteRenderer.init('gameCanvas');
        }
        character.groundY = canvas.height - 280;
        character.x = 80;
        character.walking = false;
        character.stopped = true;

        hudLevelTitle.textContent = '📖 ' + book.title;
        hudLevelTitle.style.display = 'block';
        btnStop.style.display = 'block';
        btnCamera.style.display = 'block';
        chik.classList.remove('hidden');
        if (hudCoins) {
            hudCoins.style.display = 'block';
            if (coinCount) coinCount.textContent = window.avatarModule ? window.avatarModule.getCoins() : 0;
        }

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
        } else if (part.type === 'blowing') {
            openSidePanelForBlowing(part);
        }
    }

    var blowingEffectActive = false;
    var currentBlowPart = null;

    function openSidePanelForBlowing(part) {
        panelTitle.textContent = part.title || 'Дутьё';
        panelInstruction.textContent = part.instruction || '';
        blowingSection.classList.remove('hidden');
        readingSection.classList.add('hidden');
        singingSection.classList.add('hidden');
        sidePanel.classList.remove('closed');
        sidePanel.classList.add('open');

        blowingStatus.textContent = 'Нажми «Начать дуть»!';
        currentBlowEffect = part.animation || 'fade_fog';
        currentBlowPart = part;
        blowingSectionActive = true;

        if (part.chikBefore) {
            showChik(part.chikBefore);
        }

        if (blowMeterFill) blowMeterFill.style.width = '0%';
        if (blowMeterVal) blowMeterVal.textContent = '0.00';

        blowingStartBtn.disabled = false;
        blowingStartBtn.onclick = () => {
            blowingStartBtn.disabled = true;
            blowingEffectActive = true;
            blowingStatus.textContent = 'Дуй в микрофон!';
            if (blowingDebug) blowingDebug.classList.remove('hidden');

            if (window.blowingModule && window.blowingModule.startBlowing) {
                window.blowingModule.startBlowing(
                    {
                        sensitivity: blowSensitivity ? parseFloat(blowSensitivity.value) / 1000 : 0.035,
                        multiplier: blowMultiplier ? parseFloat(blowMultiplier.value) / 100 : 1.0,
                        requiredStrength: part.requiredStrength || 0.45,
                        requiredDuration: part.requiredDuration || 2.5
                    },
                    function(strength, progress) {
                        var meterVal = progress !== undefined ? progress : strength;
                        if (blowMeterFill) blowMeterFill.style.width = Math.round(meterVal * 100) + '%';
                        if (blowMeterVal) blowMeterVal.textContent = meterVal.toFixed(2);
                    },
                    function() {
                        blowingEffectActive = false;
                        finalBlowStrength = 1;
                        blowingStatus.textContent = 'Отлично! ' + (part.chikAfter || '');
                        if (part.chikAfter) showChik(part.chikAfter);
                        if (window.blowingModule) {
                            window.blowingModule.stopBlowing();
                        }
                        setTimeout(function() {
                            finalBlowStrength = 0;
                            closeSidePanel();
                            partCompleted();
                        }, 1500);
                    }
                );
            }
        };

        blowingStopBtn.onclick = () => {
            if (window.blowingModule) window.blowingModule.stopBlowing();
            blowingEffectActive = false;
            closeSidePanel();
            partCompleted();
        };
    }

    function openSidePanelForReading(part) {
        panelTitle.textContent = 'Чтение';
        panelInstruction.textContent = 'Прочитай текст вслух. При упоминании ключевых слов на сцене появятся объекты!';
        readingSection.classList.remove('hidden');
        singingSection.classList.add('hidden');
        blowingSection.classList.add('hidden');
        sidePanel.classList.remove('closed');
        sidePanel.classList.add('open');

        const text = part.text || '';
        const triggers = part.triggers || [];

        if (window.readingModule && window.readingModule.setText) {
            window.readingModule.setText(text);
        }

        if (debugText) debugText.textContent = '';
        if (debugPanel) debugPanel.classList.add('hidden');
        debugVisible = false;
        if (debugToggleBtn) debugToggleBtn.classList.remove('active');
        if (window.readingModule && window.readingModule.clearTranscript) {
            window.readingModule.clearTranscript();
        }
        if (window.readingModule && window.readingModule.setTranscriptCallback) {
            window.readingModule.setTranscriptCallback(function(text) {
                if (debugText) debugText.textContent = text;
            });
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
        blowingSection.classList.add('hidden');
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

        var prevPart = currentBookParts[currentPartIndex];
        if (prevPart && prevPart.type === 'reading' && window.avatarModule) {
            window.avatarModule.addCoins(1);
            if (coinCount) coinCount.textContent = window.avatarModule.getCoins();
        }

        currentPartIndex++;
        showChik('Молодец! Идём дальше...');
        playTransitionSound();
        setTimeout(() => showNextPart(), 2000);
    }

    function completeLevel() {
        gameActive = false;
        if (completeTitle) completeTitle.textContent = '🎉 Конец сказки!';
        if (completeText) completeText.textContent = 'Молодец! Ты прочитал(а) всю сказку!';
        if (completeOverlay) completeOverlay.classList.remove('hidden');
        if (completeNextBtn) completeNextBtn.style.display = 'none';
        if (completeMenuBtn) {
            completeMenuBtn.textContent = '🏠 На главное меню';
            completeMenuBtn.style.display = '';
            completeMenuBtn.onclick = function() {
                completeOverlay.classList.add('hidden');
                showMenu();
            };
        }
        try {
            const audio = new Audio('sound.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch(e) {}
    }

    function closeSidePanel() {
        sidePanel.classList.remove('open');
        sidePanel.classList.add('closed');
        blowingSection.classList.add('hidden');
        readingSection.classList.add('hidden');
        singingSection.classList.add('hidden');
        blowingSectionActive = false;
    }

    panelClose.addEventListener('click', () => {
        if (window.readingModule) window.readingModule.stopReading();
        if (window.singingModule) window.singingModule.stopSinging();
        if (window.blowingModule) window.blowingModule.stopBlowing();
        blowingEffectActive = false;
        closeSidePanel();
        partCompleted();
    });

    function showChik(text) {
        chikText.textContent = text;
        chik.classList.remove('hidden');
    }

    if (debugToggleBtn) {
        debugToggleBtn.addEventListener('click', () => {
            debugVisible = !debugVisible;
            if (debugVisible) {
                debugPanel.classList.remove('hidden');
                debugToggleBtn.classList.add('active');
            } else {
                debugPanel.classList.add('hidden');
                debugToggleBtn.classList.remove('active');
            }
        });
    }

    if (debugClear) {
        debugClear.addEventListener('click', () => {
            if (window.readingModule && window.readingModule.clearTranscript) {
                window.readingModule.clearTranscript();
            }
            if (debugText) debugText.textContent = '';
        });
    }

    if (blowSensitivity && blowSensitivityVal) {
        blowSensitivity.addEventListener('input', function() {
            var val = parseFloat(this.value) / 1000;
            blowSensitivityVal.textContent = val.toFixed(3);
            if (window.blowingModule) window.blowingModule.setConfig({ sensitivity: val });
        });
    }

    if (blowMultiplier && blowMultiplierVal) {
        blowMultiplier.addEventListener('input', function() {
            var val = parseFloat(this.value) / 100;
            blowMultiplierVal.textContent = val.toFixed(2);
            if (window.blowingModule) window.blowingModule.setConfig({ multiplier: val });
        });
    }

    if (blowSimulate) {
        blowSimulate.addEventListener('click', function() {
            if (window.blowingModule && window.blowingModule.simulateBlow) {
                window.blowingModule.simulateBlow();
            }
        });
    }

    if (blowDebugToggle && blowingDebug) {
        blowDebugToggle.addEventListener('click', function() {
            blowDebugVisible = !blowDebugVisible;
            blowingDebug.classList.toggle('hidden', !blowDebugVisible);
            blowDebugToggle.classList.toggle('active', blowDebugVisible);
        });
    }

    btnCamera.addEventListener('click', () => {
        cameraEnabled = !cameraEnabled;
        if (cameraEnabled) {
            btnCamera.classList.remove('camera-off');
            btnCamera.classList.add('camera-on');
            btnCamera.innerHTML = '📷 камера';
            if (window.cameraModule) window.cameraModule.startCamera();
        } else {
            btnCamera.classList.remove('camera-on');
            btnCamera.classList.add('camera-off');
            btnCamera.innerHTML = '📷 камера';
            if (window.cameraModule) window.cameraModule.stopCamera();
        }
    });

    btnStop.addEventListener('click', () => {
        if (confirm('Выйти в меню?')) {
            if (window.readingModule) window.readingModule.stopReading();
            if (window.singingModule) window.singingModule.stopSinging();
            if (window.blowingModule) window.blowingModule.stopBlowing();
            blowingEffectActive = false;
            showMenu();
        }
    });

    function drawCharacter(x, y, frame) {
        if (window.avatarModule) {
            window.avatarModule.draw(ctx, x, y, character.width, character.height, frame);
        } else {
            const w = character.width;
            const h = character.height;
            const legSwing = Math.sin(frame * 0.15) * 8;

            ctx.fillStyle = '#42A5F5';
            ctx.fillRect(x - w / 2, y - h, w, h * 0.6);

            ctx.fillStyle = '#FFCC80';
            ctx.beginPath();
            ctx.arc(x, y - h - 28, 36, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(x - 12, y - h - 32, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 12, y - h - 32, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y - h - 20, 15, 0.1, Math.PI - 0.1);
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
            if (blowingSectionActive && currentBlowEffect && SpriteRenderer && SpriteRenderer.drawBlowingEffect) {
                var blowStr = finalBlowStrength > 0 ? finalBlowStrength : (window.blowingModule && window.blowingModule.getStrength ? window.blowingModule.getStrength() : 0);
                SpriteRenderer.drawBlowingEffect(currentBlowEffect, blowStr, Date.now());
            }
            character.walkFrame++;
            drawCharacter(character.x, character.groundY, character.walkFrame);
        }

        requestAnimationFrame(gameLoop);
    }

    function updateCharacter(dt) {
        if (!character.walking || character.stopped) return;
        const dtSec = dt / 1000;
        character.x += character.speed * dtSec;
        if (character.x > canvas.width * 0.28) {
            character.x = canvas.width * 0.28;
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
    showMenu();
})();
