(function() {
    var video = null;
    var stream = null;
    var active = false;

    function startCamera(callback) {
        if (active) {
            if (callback) callback(null, video);
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } } })
            .then(function(s) {
                stream = s;
                video = document.createElement('video');
                video.srcObject = s;
                video.playsInline = true;
                video.muted = true;
                video.play();
                active = true;
                if (callback) callback(null, video);
            })
            .catch(function(err) {
                console.error('Camera error:', err);
                active = false;
                if (callback) callback(err);
            });
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(function(t) { t.stop(); });
        }
        if (video) {
            video.pause();
            video.srcObject = null;
        }
        video = null;
        stream = null;
        active = false;
    }

    function drawFace(ctx, x, y, radius) {
        if (!active || !video || video.readyState < 2) return false;

        var vw = video.videoWidth;
        var vh = video.videoHeight;
        if (vw === 0 || vh === 0) return false;

        var size = Math.min(vw, vh);
        var sx = (vw - size) / 2;
        var sy = (vh - size) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(video, sx, sy, size, size, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();

        return true;
    }

    window.cameraModule = {
        startCamera: startCamera,
        stopCamera: stopCamera,
        drawFace: drawFace,
        isActive: function() { return active; }
    };
})();