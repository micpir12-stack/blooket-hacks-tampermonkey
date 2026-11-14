// ==UserScript==
// @name         Blooket Unbannable Coin/XP Script
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Automatically answers questions randomly and clicks continue in Blooket Study mode
// @author       Faron
// @match        https://solo.blooket.com/study*
// @grant        none
// @run-at       document-idle
// @license MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- SPEED SETTINGS (in milliseconds) ---
    const HOLD_TIME = 50;    // How long key '1' is held down (was 10)
    const LOOP_DELAY = 250;  // Time between each press (was 20 — higher = slower)

    // Create draggable GUI
    const gui = document.createElement('div');
    gui.id = 'blooketSpammerGui';
    gui.style.position = 'absolute';
    gui.style.top = '50px';
    gui.style.left = '50px';
    gui.style.zIndex = '9999';
    gui.style.backgroundColor = 'white';
    gui.style.padding = '10px';
    gui.style.borderRadius = '8px';
    gui.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
    gui.style.fontFamily = 'Arial, sans-serif';
    gui.style.width = '180px';
    gui.style.cursor = 'move';

    // Title
    const title = document.createElement('div');
    title.textContent = 'Blooket Spammer';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '16px';
    title.style.marginBottom = '10px';
    title.style.textAlign = 'center';
    gui.appendChild(title);

    // Status display
    const status = document.createElement('div');
    status.id = 'spammerStatus';
    status.textContent = 'Status: Stopped';
    status.style.marginBottom = '10px';
    status.style.padding = '5px';
    status.style.height = '20px';
    status.style.lineHeight = '20px';
    status.style.backgroundColor = '#f0f0f0';
    status.style.borderRadius = '4px';
    status.style.textAlign = 'center';
    status.style.fontWeight = 'bold';
    status.style.overflow = 'hidden';
    gui.appendChild(status);

    // Buttons
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '5px';

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start';
    startBtn.style.flex = '1';
    startBtn.style.padding = '5px';
    startBtn.style.backgroundColor = '#4CAF50';
    startBtn.style.color = 'white';
    startBtn.style.border = 'none';
    startBtn.style.borderRadius = '4px';
    startBtn.style.cursor = 'pointer';
    buttons.appendChild(startBtn);

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop';
    stopBtn.style.flex = '1';
    stopBtn.style.padding = '5px';
    stopBtn.style.backgroundColor = '#f44336';
    stopBtn.style.color = 'white';
    stopBtn.style.border = 'none';
    stopBtn.style.borderRadius = '4px';
    stopBtn.style.cursor = 'pointer';
    buttons.appendChild(stopBtn);

    gui.appendChild(buttons);
    document.body.appendChild(gui);

    // Make draggable
    let isDragging = false;
    let offsetX, offsetY;

    gui.addEventListener('mousedown', (e) => {
        if (e.target === gui) {
            isDragging = true;
            offsetX = e.clientX - gui.getBoundingClientRect().left;
            offsetY = e.clientY - gui.getBoundingClientRect().top;
            gui.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            gui.style.left = (e.clientX - offsetX) + 'px';
            gui.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        gui.style.cursor = 'move';
    });

    // Spammer state
    let isSpamming = false;
    let spammerInterval = null;
    let releaseTimeout = null;

    // Simulate key press
    function simulateKeyPress(key, isDown) {
        const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
            key: key,
            code: `Digit${key}`,
            keyCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(event);
        if (document.activeElement) {
            document.activeElement.dispatchEvent(event);
        }
    }

    // Spammer function
    function spammer() {
        if (!isSpamming) return;

        simulateKeyPress('1', true);
        updateStatus('Spamming (holding)');

        releaseTimeout = setTimeout(() => {
            if (!isSpamming) return;
            simulateKeyPress('1', false);
            updateStatus('Spamming (waiting)');
        }, HOLD_TIME);
    }

    // Update status display
    function updateStatus(text) {
        status.textContent = `Status: ${text}`;
        if (text.includes('Stopped')) {
            status.style.backgroundColor = '#f0f0f0';
        } else if (text.includes('holding')) {
            status.style.backgroundColor = '#d4edda';
        } else {
            status.style.backgroundColor = '#fff3cd';
        }
    }

    // Start spamming (loops indefinitely until Stop is pressed)
    function startSpamming() {
        if (isSpamming) return;

        isSpamming = true;
        startBtn.textContent = 'Running...';
        startBtn.style.backgroundColor = '#2E7D32';
        stopBtn.textContent = 'Stop';
        stopBtn.style.backgroundColor = '#f44336';

        spammer();
        spammerInterval = setInterval(spammer, LOOP_DELAY);
    }

    // Stop spamming
    function stopSpamming() {
        if (!isSpamming) return;

        isSpamming = false;
        clearInterval(spammerInterval);
        clearTimeout(releaseTimeout);
        spammerInterval = null;
        releaseTimeout = null;

        simulateKeyPress('1', false);

        startBtn.textContent = 'Start';
        startBtn.style.backgroundColor = '#4CAF50';
        stopBtn.textContent = 'Stopped';
        stopBtn.style.backgroundColor = '#cccccc';

        updateStatus('Stopped');
    }

    // Event listeners
    startBtn.addEventListener('click', startSpamming);
    stopBtn.addEventListener('click', stopSpamming);

    // Clean up on page navigation
    window.addEventListener('beforeunload', stopSpamming);
})();
