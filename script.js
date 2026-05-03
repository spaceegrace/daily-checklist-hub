(() => {
    let goalsData = { daily: [], monthly: [], yearly: [], history: { daily: [], monthly: [], yearly: [] }, streak: 0, lastDate: null };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
    });

    function setupEventListeners() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const input = document.getElementById(`${type}Input`);
            input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addGoal(type); });
            document.getElementById(`add${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)?.addEventListener('click', () => addGoal(type));
        });

        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if(!['BUTTON', 'LABEL'].includes(e.target.tagName)) document.getElementById('historyFooter').classList.toggle('collapsed');
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => exportData());
        document.getElementById('bannerClose')?.addEventListener('click', () => document.getElementById('backupBanner').classList.add('hidden'));
    }

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
                if (type === 'daily') checkStreak();
            }
            saveGoals(); renderGoals(type); renderMasterHistory(); updateLilyPad();
        }
    };

    function updateLilyPad() {
        const daily = goalsData.daily;
        const img = document.getElementById('growingLilyPad');
        if (!img) return;
        
        const ratio = daily.length ? daily.filter(g => g.completed).length / daily.length : 0;
        // Scales from 80px to 200px based on daily progress
        const size = 80 + (ratio * 120);
        img.style.width = `${size}px`;
    }

    function checkStreak() {
        const today = new Date().setHours(0,0,0,0);
        const last = goalsData.lastDate ? new Date(goalsData.lastDate).setHours(0,0,0,0) : null;
        
        if (last !== today) {
            goalsData.streak++;
            goalsData.lastDate = new Date().toISOString();
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

    // Storage & Rendering Helpers
    function saveGoals() { localStorage.setItem('ProgressPod_v1', JSON.stringify(goalsData)); }
    function loadGoals() {
        const saved = localStorage.getItem('ProgressPod_v1');
        if (saved) goalsData = JSON.parse(saved);
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory(); updateStreakUI(); updateLilyPad();
    }

    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        list.innerHTML = goalsData[type].map(goal => `
            <li class="goal-item" style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px dashed #eee;">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span class="${goal.completed ? 'completed' : ''}">${goal.text}</span>
                <button onclick="deleteGoal('${type}', ${goal.id})" style="margin-left:auto; background:none; border:none; cursor:pointer;">×</button>
            </li>
        `).join('') || '<li style="font-size:0.8rem; color:#999;">No goals...</li>';
        updateProgress(type);
    }

    window.deleteGoal = (type, id) => { goalsData[type] = goalsData[type].filter(g => g.id !== id); saveGoals(); renderGoals(type); updateLilyPad(); };
    window.deleteHistoryItem = (type, id) => { goalsData.history[type] = goalsData.history[type].filter(h => h.id !== id); saveGoals(); renderMasterHistory(); };

    function renderMasterHistory() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const container = document.getElementById(`${type}HistoryList`);
            if (container) container.innerHTML = goalsData.history[type].map(h => `
                <div style="font-size:0.8rem; padding:4px; display:flex; justify-content:space-between;">
                    <span>${h.text}</span>
                    <button onclick="deleteHistoryItem('${type}', ${h.id})" style="background:none; border:none; color:#666; cursor:pointer;">×</button>
                </div>
            `).join('') || '<span style="color:#666; font-size:0.7rem;">None</span>';
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
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "ProgressPod.json"; a.click();
    }

    function displayCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
})();
