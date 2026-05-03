(function() {
    var audioCtx = null;
    var analyser = null;
    var micStream = null;

    function getAudioContext(callback) {
        if (audioCtx && micStream) {
            callback(null, { ctx: audioCtx, analyser: analyser, stream: micStream });
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                micStream = stream;
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 2048;
                var source = audioCtx.createMediaStreamSource(micStream);
                source.connect(analyser);
                callback(null, { ctx: audioCtx, analyser: analyser, stream: micStream });
            })
            .catch(function(e) {
                console.error('Cannot access microphone:', e);
                callback(e);
            });
    }

    function stopAllAudio() {
        if (micStream) {
            micStream.getTracks().forEach(function(t) { t.stop(); });
        }
        if (audioCtx) {
            audioCtx.close();
        }
        audioCtx = null;
        analyser = null;
        micStream = null;
    }

    window.audioManager = {
        getAudioContext: getAudioContext,
        stopAllAudio: stopAllAudio
    };
})();
