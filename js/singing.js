(function() {
    var canvas = document.getElementById('singCanvas');
    var ctx = canvas.getContext('2d');
    
    var audioCtx, analyser, micStream;
    var bufferLength = 2048;
    var dataArray = new Float32Array(bufferLength);
    var currentFreq = 0;
    var currentVolume = 0;
    var active = false;
    var audioInitialized = false;

    var allNotes = NOTE_FREQS.map(function(n) {
        return {
            name: n.name,
            freq: n.freq,
            color: n.color,
            progress: 0,
            raised: false,
            matched: false,
            holdTime: 0,
            target: false
        };
    });

    var targetNotes = [];
    var targetNoteSet = new Set();
    var allTargetsCaught = false;
    var onAllCaught = null;

    function resizeCanvas() {
        var parent = canvas.parentElement;
        var w = parent.clientWidth - 40;
        canvas.width = w > 100 ? w : 300;
        canvas.height = 220;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function updatePitch() {
        if (!analyser || !active) return;
        analyser.getFloatTimeDomainData(dataArray);
        var res = detectPitch(dataArray, audioCtx.sampleRate);
        currentFreq = res.freq;
        currentVolume = res.volume;

        var freqEl = document.getElementById('freqDisplay');
        var noteEl = document.getElementById('noteDisplay');

        if (currentFreq > 0 && currentVolume > 0.01) {
            freqEl.textContent = currentFreq.toFixed(1);
            var closest = getClosestNote(currentFreq);
            noteEl.textContent = closest.name;
            noteEl.style.color = closest.color;

            if (targetNoteSet.has(closest.name) && closest.diff < 40) {
                allNotes.forEach(function(n) {
                    if (n.name === closest.name) {
                        n.holdTime += 1 / 60;
                        n.progress = Math.min(1, n.holdTime);
                        if (n.progress >= 1 && !n.raised) {
                            n.raised = true;
                            n.matched = true;
                            playTone(n.freq, 0.3, 0.15);
                        }
                    }
                });
            } else {
                allNotes.forEach(function(n) {
                    if (n.target && !n.raised) {
                        n.holdTime = Math.max(0, n.holdTime - 0.03);
                        n.progress = n.holdTime;
                    }
                });
            }
        } else {
            freqEl.textContent = '--';
            noteEl.textContent = '--';
            allNotes.forEach(function(n) {
                if (n.target && !n.raised) {
                    n.holdTime = Math.max(0, n.holdTime - 0.02);
                    n.progress = n.holdTime;
                }
            });
        }

        if (!allTargetsCaught && onAllCaught) {
            var allDone = allNotes.filter(function(n) { return n.target; }).every(function(n) { return n.raised; });
            if (allDone) {
                allTargetsCaught = true;
                setTimeout(function() { if (onAllCaught) onAllCaught(); }, 500);
            }
        }

        drawNotes();
        requestAnimationFrame(updatePitch);
    }

    function drawNotes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#1a1a2e');
        bg.addColorStop(1, '#16213e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var time = Date.now() / 1000;
        for (var i = 0; i < 20; i++) {
            var sx = (i * 73 + 11) % canvas.width;
            var sy = (i * 47 + 5) % (canvas.height - 40);
            var b = 0.2 + 0.8 * Math.abs(Math.sin(time + i * 0.7));
            ctx.fillStyle = 'rgba(255,255,255,' + b + ')';
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        var groundY = canvas.height - 30;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, groundY);
        ctx.lineTo(canvas.width - 10, groundY);
        ctx.stroke();

        var noteWidth = (canvas.width - 40) / allNotes.length;
        allNotes.forEach(function(note, i) {
            var x = 20 + i * noteWidth + noteWidth / 2;
            var baseY = groundY - 15;
            var maxRise = -canvas.height * 0.45;
            var riseY = baseY + maxRise * note.progress;
            var isTarget = note.target;
            var isRaised = note.raised;

            ctx.strokeStyle = isTarget ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY + maxRise);
            ctx.stroke();

            if (isTarget && !isRaised) {
                ctx.strokeStyle = note.color + '60';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(x, baseY);
                ctx.lineTo(x, riseY);
                ctx.stroke();
            }

            if (isTarget && !isRaised) {
                var pulse = 0.5 + Math.sin(time * 3) * 0.3;
                ctx.strokeStyle = note.color;
                ctx.globalAlpha = pulse;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, baseY + maxRise, 18, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            var radius = isRaised ? 20 : 16;
            var noteColor = isRaised ? note.color : (isTarget ? note.color + '80' : '#555');

            if (isTarget) {
                ctx.shadowColor = note.color;
                ctx.shadowBlur = isRaised ? 20 : 10;
            }

            ctx.fillStyle = noteColor;
            ctx.beginPath();
            ctx.arc(x, riseY, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = isRaised ? '#FFF' : (isTarget ? '#DDD' : '#666');
            ctx.font = (isRaised ? 'bold ' : '') + '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(note.name, x, riseY);

            ctx.fillStyle = '#888';
            ctx.font = '10px sans-serif';
            ctx.fillText(Math.round(note.freq), x, groundY + 10);

            if (isRaised) {
                ctx.fillStyle = '#4CAF50';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText('✓', x, riseY - radius - 10);
            }
        });

        if (currentFreq > 0 && currentVolume > 0.01) {
            var closest = getClosestNote(currentFreq);
            var idx = -1;
            for (var j = 0; j < allNotes.length; j++) {
                if (allNotes[j].name === closest.name) { idx = j; break; }
            }
            if (idx >= 0) {
                var x = 20 + idx * noteWidth + noteWidth / 2;
                ctx.fillStyle = closest.color;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(x, groundY, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }

    function startSinging(notesList, onCaught) {
        if (audioInitialized) return false;
        audioInitialized = true;
        
        audioManager.getAudioContext(function(err, audio) {
            if (err || !audio) { audioInitialized = false; return; }

            audioCtx = audio.ctx;
            analyser = audio.analyser;
            micStream = audio.stream;
            active = false;

            allNotes.forEach(function(n) {
                n.progress = 0;
                n.raised = false;
                n.matched = false;
                n.holdTime = 0;
            });

            targetNotes = notesList;
            targetNoteSet = new Set(notesList);
            allTargetsCaught = false;
            onAllCaught = onCaught;

            allNotes.forEach(function(n) {
                if (targetNoteSet.has(n.name)) {
                    n.target = true;
                } else {
                    n.target = false;
                }
            });

            resizeCanvas();
            active = true;
            updatePitch();
        });
        return true;
    }

    function stopSinging() {
        active = false;
        audioInitialized = false;
    }

    window.singingModule = {
        startSinging: startSinging,
        stopSinging: stopSinging
    };
})();
