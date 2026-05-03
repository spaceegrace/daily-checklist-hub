(() => {
    let goalsData = { daily: [], monthly: [], yearly: [], history: { daily: [], monthly: [], yearly: [] }, streak: 0, lastCompletionDate: null };
    let timerInterval;
    let timeLeft = 25 * 60;

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
        updateStreakUI();
    });

    function setupEventListeners() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const input = document.getElementById(`${type}Input`);
            input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addGoal(type); });
            document.getElementById(`add${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)?.addEventListener('click', () => addGoal(type));
        });

        // Timer Controls
        document.getElementById('startTimer')?.addEventListener('click', toggleTimer);
        document.getElementById('resetTimer')?.addEventListener('click', resetTimer);

        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if(!['BUTTON', 'LABEL'].includes(e.target.tagName)) document.getElementById('historyFooter').classList.toggle('collapsed');
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => exportData());
        document.getElementById('bannerClose')?.addEventListener('click', () => document.getElementById('backupBanner').classList.add('hidden'));
    }

    // --- Focus Timer Logic ---
    function toggleTimer() {
        const btn = document.getElementById('startTimer');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            btn.textContent = '▶️';
        } else {
            btn.textContent = '⏸️';
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerUI();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    alert("Time's up! Great focus! 🐸");
                    resetTimer();
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = 25 * 60;
        updateTimerUI();
        document.getElementById('startTimer').textContent = '▶️';
    }

    function updateTimerUI() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timerText').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- Goal & Streak Logic ---
    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        if (!input?.value.trim()) return;
        goalsData[type].push({ id: Date.now(), text: input.value.trim(), completed: false });
        saveGoals(); renderGoals(type); input.value = ''; updateLilyPad();
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goalsData.history[type].push({ text: goal.text, id: Date.now() });
                if (type === 'daily') handleStreak();
            }
            saveGoals(); renderGoals(type); renderMasterHistory(); updateLilyPad();
        }
    };

    function handleStreak() {
        const today = new Date().setHours(0,0,0,0);
        const last = goalsData.lastCompletionDate ? new Date(goalsData.lastCompletionDate).setHours(0,0,0,0) : null;
        if (last !== today) {
            goalsData.streak++;
            goalsData.lastCompletionDate = new Date().toISOString();
            updateStreakUI();
        }
    }

    function updateStreakUI() {
        const el = document.getElementById('streakCount');
        if (!el) return;
        el.textContent = goalsData.streak;
        el.classList.toggle('streak-gold', goalsData.streak >= 7);
        el.classList.toggle('streak-sparkle', goalsData.streak >= 30);
    }

    function updateLilyPad() {
        const daily = goalsData.daily;
        const pad = document.getElementById('magicLilyPad');
        if (!pad) return;
        const ratio = daily.length ? daily.filter(g => g.completed).length / daily.length : 0;
        const size = 120 + (ratio * 60);
        pad.style.width = `${size}px`;
        pad.style.height = `${size}px`;
    }

    // --- Storage & Rendering (Simplified) ---
    function loadGoals() {
        const saved = localStorage.getItem('FroggyHub_v10');
        if (saved) goalsData = JSON.parse(saved);
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory();
        updateLilyPad();
    }

    function saveGoals() { localStorage.setItem('FroggyHub_v10', JSON.stringify(goalsData)); }

    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        list.innerHTML = goalsData[type].map(goal => `
            <li class="goal-item">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span>${goal.text}</span>
                <button onclick="deleteGoal('${type}', ${goal.id})">×</button>
            </li>
        `).join('') || '<li class="empty">No hops yet...</li>';
        updateProgress(type);
    }

    window.deleteGoal = (type, id) => { goalsData[type] = goalsData[type].filter(g => g.id !== id); saveGoals(); renderGoals(type); updateLilyPad(); };
    window.deleteHistoryItem = (type, id) => { goalsData.history[type] = goalsData.history[type].filter(h => h.id !== id); saveGoals(); renderMasterHistory(); };

    function renderMasterHistory() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const container = document.getElementById(`${type}HistoryList`);
            if (container) container.innerHTML = goalsData.history[type].map(h => `
                <div class="history-pill"><span>${h.text}</span><button onclick="deleteHistoryItem('${type}', ${h.id})">×</button></div>
            `).join('') || '<span>Empty</span>';
        });
    }

    function updateProgress(type) {
        const goals = goalsData[type];
        const percent = goals.length ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) : 0;
        const bar = document.getElementById(`${type}Progress`);
        const text = document.getElementById(`${type}ProgressText`);
        if (bar) bar.style.width = percent + '%';
        if (text) text.textContent = percent + '%';
    }

    function exportData() {
        const blob = new Blob([JSON.stringify(goalsData)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "FroggyHub.json"; a.click();
    }

    function displayCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
})();
