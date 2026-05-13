(function() {
    var active = false;
    var animFrame = null;
    var onStrengthCallback = null;
    var onCompleteCallback = null;

    var config = {
        sensitivity: 0.035,
        multiplier: 1.0,
        requiredStrength: 0.45,
        requiredDuration: 2.5
    };

    var currentStrength = 0;
    var accumulatedProgress = 0;
    var completed = false;
    var analyser = null;
    var audioCtx = null;
    var dataArray = null;
    var simulateMode = false;
    var simulateStrength = 0;
    var simulateStart = 0;
    var lastTickTime = 0;

    function startBlowing(opts, onStrength, onComplete) {
        if (active) stopBlowing();

        if (opts) {
            if (opts.sensitivity !== undefined) config.sensitivity = opts.sensitivity;
            if (opts.multiplier !== undefined) config.multiplier = opts.multiplier;
            if (opts.requiredStrength !== undefined) config.requiredStrength = opts.requiredStrength;
            if (opts.requiredDuration !== undefined) config.requiredDuration = opts.requiredDuration;
        }

        onStrengthCallback = onStrength;
        onCompleteCallback = onComplete;

        window.audioManager.getAudioContext(function(err, audioData) {
            if (err) {
                console.error('Cannot start blowing: no mic access');
                if (onComplete) onComplete();
                return;
            }

            audioCtx = audioData.ctx;
            analyser = audioData.analyser;
            dataArray = new Float32Array(analyser.fftSize);

            active = true;
            completed = false;
            accumulatedProgress = 0;
            currentStrength = 0;
            simulateMode = false;
            lastTickTime = Date.now();

            tick();
        });
    }

    function tick() {
        if (!active) return;

        var now = Date.now();
        var dt = lastTickTime > 0 ? (now - lastTickTime) / 1000 : 0.016;
        lastTickTime = now;

        if (simulateMode) {
            var elapsed = (now - simulateStart) / 1000;
            if (elapsed < 1) {
                currentStrength = elapsed;
            } else if (elapsed < 3) {
                currentStrength = 1;
            } else if (elapsed < 4) {
                currentStrength = 4 - elapsed;
            } else {
                currentStrength = 0;
                simulateMode = false;
            }
        } else if (analyser && dataArray) {
            analyser.getFloatTimeDomainData(dataArray);

            var sumSq = 0;
            for (var i = 0; i < dataArray.length; i++) {
                sumSq += dataArray[i] * dataArray[i];
            }
            var rms = Math.sqrt(sumSq / dataArray.length);

            // Improved blow detection: RMS threshold + pitch floor detection
            var pitch = detectPitch(dataArray, audioCtx.sampleRate);
            var isBlowing = false;

            // Blowing produces broadband noise: high RMS, no clear pitch
            if (rms > config.sensitivity) {
                // pitch.freq < 80 = low rumble (blowing)
                // rms > 0.15 = very loud = definitely blowing
                if (pitch.freq < 80 || rms > 0.15) {
                    isBlowing = true;
                }
            }

            if (isBlowing) {
                currentStrength = Math.min(rms / 0.3, 1.0) * config.multiplier;
                currentStrength = Math.min(Math.max(currentStrength, 0), 1);

                if (currentStrength >= config.requiredStrength) {
                    // Accumulate progress over time
                    accumulatedProgress += dt / config.requiredDuration;
                    accumulatedProgress = Math.min(accumulatedProgress, 1);

                    if (accumulatedProgress >= 1 && !completed) {
                        completed = true;
                        if (onCompleteCallback) onCompleteCallback();
                    }
                }
            } else {
                // Gradually decay strength but KEEP accumulated progress
                currentStrength *= 0.9;
                if (currentStrength < 0.01) currentStrength = 0;
            }
        }

        if (onStrengthCallback) onStrengthCallback(currentStrength, accumulatedProgress);

        animFrame = requestAnimationFrame(tick);
    }

    function simulateBlow() {
        if (!active) return;
        simulateMode = true;
        simulateStart = Date.now();
        currentStrength = 0;
    }

    function stopBlowing() {
        active = false;
        if (animFrame) {
            cancelAnimationFrame(animFrame);
            animFrame = null;
        }
        currentStrength = 0;
        accumulatedProgress = 0;
        completed = false;
        simulateMode = false;
        lastTickTime = 0;
    }

    function setConfig(newConfig) {
        if (newConfig.sensitivity !== undefined) config.sensitivity = newConfig.sensitivity;
        if (newConfig.multiplier !== undefined) config.multiplier = newConfig.multiplier;
    }

    window.blowingModule = {
        startBlowing: startBlowing,
        stopBlowing: stopBlowing,
        setConfig: setConfig,
        simulateBlow: simulateBlow,
        getStrength: function() { return currentStrength; },
        getProgress: function() { return accumulatedProgress; },
        setStrength: function(val) { currentStrength = val; },
        getConfig: function() { return {
            sensitivity: config.sensitivity,
            multiplier: config.multiplier,
            requiredStrength: config.requiredStrength,
            requiredDuration: config.requiredDuration
        }; }
    };
})();
