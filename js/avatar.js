(function() {
    var ITEMS = {
        hair: {
            label: 'Причёска',
            options: [
                { id: 'none', label: 'Нет', price: 0 },
                { id: 'cap', label: 'Кепка', price: 3 },
                { id: 'elvis', label: 'Элвис', price: 5 },
                { id: 'mohawk_red', label: 'Ирокез красный', price: 4 }
            ]
        },
        neck: {
            label: 'Шея',
            options: [
                { id: 'none', label: 'Нет', price: 0 },
                { id: 'necklace', label: 'Ожерелье', price: 3 }
            ]
        },
        body: {
            label: 'Тело',
            options: [
                { id: 'red', label: 'Красный', price: 0, color: '#E53935' },
                { id: 'blue', label: 'Синий', price: 0, color: '#1E88E5' },
                { id: 'yellow', label: 'Жёлтый', price: 1, color: '#FDD835' }
            ]
        },
        pants: {
            label: 'Штаны',
            options: [
                { id: 'blue', label: 'Синие', price: 0, color: '#1565C0' },
                { id: 'red', label: 'Красные', price: 1, color: '#C62828' },
                { id: 'yellow', label: 'Жёлтые', price: 1, color: '#F9A825' }
            ]
        },
        hands: {
            label: 'Руки',
            options: [
                { id: 'none', label: 'Нет', price: 0 },
                { id: 'butterfly_net', label: 'Сачок', price: 5 },
                { id: 'gloves', label: 'Перчатки чёрные', price: 3 }
            ]
        }
    };

    var state = {
        coins: 0,
        owned: {},
        current: {
            hair: 'none',
            neck: 'none',
            body: 'blue',
            pants: 'blue',
            hands: 'none'
        }
    };

    function load() {
        try {
            var raw = localStorage.getItem('avatar_save');
            if (raw) {
                var saved = JSON.parse(raw);
                state.coins = saved.coins || 0;
                state.owned = saved.owned || {};
                if (saved.current) {
                    Object.keys(state.current).forEach(function(k) {
                        if (saved.current[k]) state.current[k] = saved.current[k];
                    });
                }
            }
        } catch(e) {}
    }

    function save() {
        try {
            localStorage.setItem('avatar_save', JSON.stringify({
                coins: state.coins,
                owned: state.owned,
                current: state.current
            }));
        } catch(e) {}
    }

    function getItems() { return ITEMS; }
    function getCoins() { return state.coins; }
    function addCoins(n) { state.coins += n; save(); }
    function spendCoins(n) { if (state.coins >= n) { state.coins -= n; save(); return true; } return false; }
    function getCurrent() { return state.current; }
    function getOwned() { return state.owned; }

    function isOwned(slot, id) {
        if (id === 'none') return true;
        var item = ITEMS[slot].options.find(function(o) { return o.id === id; });
        if (!item) return false;
        if (item.price === 0) return true;
        return state.owned[slot + '_' + id] === true;
    }

    function select(slot, id) {
        if (!ITEMS[slot]) return false;
        var item = ITEMS[slot].options.find(function(o) { return o.id === id; });
        if (!item) return false;
        if (item.price > 0 && !state.owned[slot + '_' + id]) return false;
        state.current[slot] = id;
        save();
        return true;
    }

    function buy(slot, id) {
        if (!ITEMS[slot]) return false;
        var item = ITEMS[slot].options.find(function(o) { return o.id === id; });
        if (!item || item.price === 0) return false;
        if (state.owned[slot + '_' + id]) return true;
        if (state.coins < item.price) return false;
        state.coins -= item.price;
        state.owned[slot + '_' + id] = true;
        state.current[slot] = id;
        save();
        return true;
    }

    function draw(ctx, x, y, w, h, frame, custom) {
        var c = custom || state.current;
        var bodyColor = '#1E88E5';
        var pantsColor = '#1565C0';
        var skinColor = '#FFCC80';
        var legSwing = Math.sin((frame || 0) * 0.15) * 8;

        var bodyOpt = ITEMS.body.options.find(function(o) { return o.id === c.body; });
        if (bodyOpt && bodyOpt.color) bodyColor = bodyOpt.color;

        var pantsOpt = ITEMS.pants.options.find(function(o) { return o.id === c.pants; });
        if (pantsOpt && pantsOpt.color) pantsColor = pantsOpt.color;

        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x - w / 2, y - h, w, h * 0.6);

        // Arms (skin color)
        ctx.strokeStyle = skinColor;
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

        // Hands
        if (c.hands === 'gloves') {
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(x - w / 2 - 8, y - h + 18 + legSwing, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + w / 2 + 8, y - h + 18 - legSwing, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (c.hands === 'butterfly_net') {
            // Left hand: stick + net circle
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - w / 2 - 8, y - h + 18 + legSwing);
            ctx.lineTo(x - w / 2 - 25, y - h + 40 + legSwing);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(200,200,200,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x - w / 2 - 25, y - h + 38 + legSwing, 12, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.arc(x - w / 2 - 8, y - h + 18 + legSwing, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + w / 2 + 8, y - h + 18 - legSwing, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pants (legs)
        ctx.strokeStyle = pantsColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - h * 0.4);
        ctx.lineTo(x - 5 + legSwing, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 5, y - h * 0.4);
        ctx.lineTo(x + 5 - legSwing, y);
        ctx.stroke();

        // Feet
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - 5 + legSwing, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5 - legSwing, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Head
        var faceDrawn = false;
        if (window.cameraModule && window.cameraModule.isActive()) {
            faceDrawn = window.cameraModule.drawFace(ctx, x, y - h - 28, 38);
        }
        if (!faceDrawn) {
            ctx.fillStyle = skinColor;
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
        }

        // Hair (on top of head)
        if (c.hair === 'cap') {
            ctx.fillStyle = '#F44336';
            ctx.beginPath();
            ctx.ellipse(x, y - h - 56, 36, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - 36, y - h - 56, 72, 16);
            ctx.fillStyle = '#C62828';
            ctx.beginPath();
            ctx.arc(x, y - h - 60, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (c.hair === 'elvis') {
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.ellipse(x - 36, y - h - 46, 12, 24, -0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 36, y - h - 46, 12, 24, 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - 36, y - h - 63, 72, 20);
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.ellipse(x - 22, y - h - 67, 26, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 22, y - h - 67, 26, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 20, y - h - 67, 14, 30, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - 24, y - h - 75, 48, 16);
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.ellipse(x - 14, y - h - 75, 18, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 14, y - h - 75, 18, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (c.hair === 'mohawk_red') {
            ctx.fillStyle = '#D32F2F';
            for (var hi = -20; hi <= 20; hi += 10) {
                ctx.beginPath();
                ctx.ellipse(x + hi, y - h - 62 - Math.abs(hi) * 1.2, 7, 18 + Math.abs(hi) * 1.5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Neck (under head, on top of body)
        if (c.neck === 'necklace') {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(x, y - h + 3, 10, 6, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y - h + 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 6, y - h + 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 6, y - h + 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    load();

    window.avatarModule = {
        getItems: getItems,
        getCoins: getCoins,
        addCoins: addCoins,
        spendCoins: spendCoins,
        getCurrent: getCurrent,
        getOwned: getOwned,
        isOwned: isOwned,
        select: select,
        buy: buy,
        draw: draw,
        load: load,
        save: save
    };
})();
