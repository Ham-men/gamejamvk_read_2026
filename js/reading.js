var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = null;
var active = false;
var currentKeywords = [];
var onKeywordCaught = null;
var currentBook = null;
var originalText = '';
var markedWords = [];
var allWordsInPart = [];
var progressCallback = null;
var onPartCompleteCallback = null;
var partCompleted = false;
var readLines = [];
var recognitionStarting = false;

function resetState() {
    markedWords = [];
    partCompleted = false;
    allWordsInPart = [];
    readLines = [];
}

function setupRecognition() {
    if (!SpeechRecognition) return false;
    try {
        recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.continuous = true;
        recognition.interimResults = false;
    } catch(e) {
        return false;
    }

    recognition.onresult = function(event) {
        if (!active) return;
        var last = event.results[event.results.length - 1];
        var transcript = last[0].transcript.toLowerCase().trim();
        
        var normalizedTranscript = transcript.replace(/ё/g, 'е');
        
        if (currentBook && currentBook.triggerSprites) {
            var entries = Object.entries(currentBook.triggerSprites);
            for (var i = 0; i < entries.length; i++) {
                var word = entries[i][0];
                var sprite = entries[i][1];
                var normalizedWord = word.toLowerCase().replace(/ё/g, 'е');
                if (normalizedTranscript.indexOf(normalizedWord) !== -1) {
                    if (SpriteRenderer && SpriteRenderer.spawnAtGround) {
                        SpriteRenderer.spawnAtGround(sprite);
                    }
                    break;
                }
            }
        }

        var spokenWords = normalizedTranscript.split(' ').map(function(w) { 
            return w.replace(/[.,!?;:()\[\]{}]/g, '').toLowerCase();
        }).filter(function(w) { return w.length > 0; });
        
        spokenWords.forEach(function(w) {
            if (markedWords.indexOf(w) === -1) {
                markedWords.push(w);
            }
        });

        for (var j = 0; j < currentKeywords.length; j++) {
            var kw = currentKeywords[j];
            var normalizedKw = kw.toLowerCase().replace(/ё/g, 'е');
            if (normalizedTranscript.indexOf(normalizedKw) !== -1) {
                if (onKeywordCaught) onKeywordCaught(kw);
                break;
            }
        }

        updateTextDisplay();
        checkProgress();
    };

    recognition.onerror = function(e) {
        recognitionStarting = false;
        var statusEl = document.getElementById('reading-status');
        if (statusEl && e.error !== 'no-speech') {
            statusEl.textContent = 'Ошибка: ' + e.error;
        }
    };

    recognition.onend = function() {
        recognitionStarting = false;
    };

    return true;
}

function updateTextDisplay() {
    var textArea = document.getElementById('reading-text-area');
    if (!textArea) return;
    
    if (!originalText) {
        textArea.innerHTML = '';
        return;
    }

    var lines = originalText.split('\n').filter(function(l) { return l.trim(); });
    var processedLines = lines.map(function(line, lineIndex) {
        var normalizedLine = line.toLowerCase().replace(/ё/g, 'е');
        var wordsInLine = normalizedLine.split(' ').map(function(w) { 
            return w.replace(/[.,!?;:()\[\]{}]/g, '').toLowerCase();
        }).filter(function(w) { return w.length > 0; });
        
        var allWordsRead = wordsInLine.length > 0 && wordsInLine.every(function(w) { 
            return markedWords.indexOf(w) !== -1; 
        });
        
        if (allWordsRead) {
            readLines.push(lineIndex);
            return '<span class="line-read">' + line + '</span>';
        } else {
            var idx = readLines.indexOf(lineIndex);
            if (idx !== -1) readLines.splice(idx, 1);
            
            var processedLine = line;
            markedWords.forEach(function(word) {
                if (word.length < 1) return;
                try {
                    var escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    var regex = new RegExp('(^|[^а-яё])(' + escapedWord + ')(?=[^а-яё]|$)', 'gi');
                    processedLine = processedLine.replace(regex, '$1<span class="word-read">$2</span>');
                } catch (e) {}
            });
            return processedLine;
        }
    });
    
    textArea.innerHTML = processedLines.join('<br>');
    
    var allLinesRead = lines.length > 0 && readLines.length === lines.length;
    if (allLinesRead && !partCompleted) {
        if (onPartCompleteCallback) onPartCompleteCallback();
    }
}

function checkProgress() {
    if (allWordsInPart.length === 0 || partCompleted) return;
    
    var matched = 0;
    allWordsInPart.forEach(function(w) {
        if (markedWords.indexOf(w) !== -1) matched++;
    });

    var percent = matched / allWordsInPart.length;
    
    if (progressCallback) progressCallback(percent);

    if ((percent > 0.7 || matched >= allWordsInPart.length) && !partCompleted) {
        partCompleted = true;
        if (onPartCompleteCallback) onPartCompleteCallback();
    }
}

function startReading(keywords, onCaught, book) {
    if (recognitionStarting) return false;
    if (active) {
        try { recognition.stop(); } catch(e) {}
    }
    
    if (!SpeechRecognition) {
        var el = document.getElementById('reading-status');
        if (el) el.textContent = 'Используйте Chrome для распознавания речи.';
        return false;
    }
    
    recognitionStarting = true;
    
    if (!recognition) {
        var ok = setupRecognition();
        if (!ok) { recognitionStarting = false; return false; }
    }
    
    resetState();
    
    currentKeywords = keywords;
    onKeywordCaught = onCaught;
    currentBook = book;
    active = true;
    
    if (originalText) {
        allWordsInPart = originalText.toLowerCase().split(' ').map(function(w) { 
            return w.replace(/[.,!?;:()\[\]{}]/g, '').toLowerCase();
        }).filter(function(w) { return w.length > 0; });
    }
    
    try { 
        recognition.start(); 
    } catch (e) { 
        recognitionStarting = false;
    }
    
    var container = document.getElementById('reading-keywords');
    if (container) {
        container.innerHTML = '';
        keywords.forEach(function(kw) {
            var tag = document.createElement('span');
            tag.className = 'keyword-tag';
            tag.textContent = kw;
            container.appendChild(tag);
        });
    }
    
    return true;
}

function stopReading() {
    active = false;
    recognitionStarting = false;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
}

window.readingModule = {
    startReading: startReading,
    stopReading: stopReading,
    setText: function(text) { 
        originalText = text.replace(/ё/g, 'е'); 
        markedWords = [];
        readLines = [];
        if (originalText) {
            allWordsInPart = originalText.toLowerCase().split(' ').map(function(w) { 
                return w.replace(/[.,!?;:()\[\]{}]/g, '').toLowerCase();
            }).filter(function(w) { return w.length > 0; });
        }
        updateTextDisplay();
    },
    setProgressCallback: function(callback) { progressCallback = callback; },
    setPartCompleteCallback: function(callback) { onPartCompleteCallback = callback; }
};
