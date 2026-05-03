(function() {
    var NOTE_FREQS = [
        { name: 'До', freq: 261.63, color: '#FF5252' },
        { name: 'Ре', freq: 293.66, color: '#FF9800' },
        { name: 'Ми', freq: 329.63, color: '#FFEB3B' },
        { name: 'Фа', freq: 349.23, color: '#4CAF50' },
        { name: 'Соль', freq: 392.00, color: '#2196F3' },
        { name: 'Ля', freq: 440.00, color: '#9C27B0' },
        { name: 'Си', freq: 493.88, color: '#E91E63' }
    ];

    window.NOTE_FREQS = NOTE_FREQS;

    function getClosestNote(freq) {
        if (freq <= 0) return { name: '--', freq: 0, diff: Infinity, color: '#888' };
        var best = NOTE_FREQS[0];
        var minDiff = Math.abs(freq - best.freq);
        for (var i = 0; i < NOTE_FREQS.length; i++) {
            var n = NOTE_FREQS[i];
            var d = Math.abs(freq - n.freq);
            if (d < minDiff) { minDiff = d; best = n; }
        }
        return { name: best.name, freq: best.freq, diff: minDiff, color: best.color };
    }

    window.getClosestNote = getClosestNote;

    function detectPitch(buffer, sampleRate) {
        var size = buffer.length;
        var rms = 0;
        for (var i = 0; i < size; i++) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / size);
        if (rms < 0.01) return { freq: -1, volume: rms };

        var windowed = new Float32Array(size);
        for (var i = 0; i < size; i++) {
            windowed[i] = buffer[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1)));
        }

        var maxBin = 0, maxMag = 0;
        var freqRes = sampleRate / size;
        var minBin = Math.floor(80 / freqRes);
        var maxBinIdx = Math.min(Math.floor(1200 / freqRes), Math.floor(size / 2));

        for (var bin = minBin; bin < maxBinIdx; bin++) {
            var real = 0, imag = 0;
            for (var i = 0; i < size; i++) {
                var angle = -2 * Math.PI * bin * i / size;
                real += windowed[i] * Math.cos(angle);
                imag += windowed[i] * Math.sin(angle);
            }
            var mag = Math.sqrt(real * real + imag * imag);
            if (mag > maxMag) { maxMag = mag; maxBin = bin; }
        }

        return { freq: maxBin * freqRes, volume: rms };
    }

    window.detectPitch = detectPitch;

    function playTone(freq, duration, volume) {
        duration = duration || 0.3;
        volume = volume || 0.15;
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    }

    window.playTone = playTone;
})();
