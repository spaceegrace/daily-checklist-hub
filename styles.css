(() => {
    let goalsData = { daily: [], monthly: [], yearly: [], history: { daily: [], monthly: [], yearly: [] }, streak: 0, lastDate: null, currentMood: 'happy', waterCount: 0 };
    const moodEmojis = { happy: "😊", calm: "😌", focused: "🧐", tired: "😴", null: "🐸" };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate(); loadGoals(); setupEventListeners();
    });

    function setupEventListeners() {
        // Goal Inputs
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const input = document.getElementById(`${type}Input`);
            input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addGoal(type); });
            document.getElementById(`add${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)?.addEventListener('click', () => addGoal(type));
        });

        // Drawer Controls
        document.getElementById('drawerToggle')?.addEventListener('click', () => document.getElementById('sideDrawer').classList.add('open'));
        document.getElementById('drawerClose')?.addEventListener('click', () => document.getElementById('sideDrawer').classList.remove('open'));

        // Mood & Water
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                goalsData.currentMood = btn.dataset.mood;
                saveGoals();
            });
        });
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => {
                goalsData.waterCount = goalsData.waterCount === i + 1 ? i : i + 1;
                renderWater(); saveGoals();
            });
        });

        // Achievement Bar Toggle
        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if (!['BUTTON', 'LABEL'].includes(e.target.tagName)) {
                document.getElementById('historyFooter').classList.toggle('collapsed');
                document.getElementById('historyChevron').textContent = document.getElementById('historyFooter').classList.contains('collapsed') ? '▼' : '▲';
            }
        });

        document.getElementById('bannerClose')?.addEventListener('click', () => document.getElementById('backupBanner').style.display = 'none');
        document.getElementById('exportBtn')?.addEventListener('click', exportData);
        document.getElementById('importFile')?.addEventListener('change', importData);
    }

    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        const energy = document.getElementById('energyLevel')?.value || 'high';
        if (!input?.value.trim()) return;
        goalsData[type].push({ id: Date.now(), text: input.value.trim(), completed: false, energy });
        saveGoals(); renderGoals(type); input.value = '';
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goalsData.history[type].push({ text: goal.text, id: Date.now(), mood: goalsData.currentMood, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
                if (type === 'daily') checkStreak();
            }
            saveGoals(); renderGoals(type); renderMasterHistory();
        }
    };

    function checkStreak() {
        const today = new Date().setHours(0,0,0,0);
        const last = goalsData.lastDate ? new Date(goalsData.lastDate).setHours(0,0,0,0) : null;
        if (last !== today) { goalsData.streak++; goalsData.lastDate = new Date().toISOString(); updateStreakUI(); }
    }

    function renderWater() {
        document.querySelectorAll('.drop-btn').forEach((btn, i) => i < goalsData.waterCount ? btn.classList.add('active') : btn.classList.remove('active'));
    }

    function updateProgress(type) {
        const goals = goalsData[type], total = goals.length, comp = goals.filter(g => g.completed).length;
        const per = total ? Math.round((comp / total) * 100) : 0;
        document.getElementById(`${type}ProgressText`).textContent = per + '%';
        document.getElementById(`${type}Progress`).style.width = per + '%';
        document.getElementById(`${type}CountText`).textContent = `(${comp} of ${total})`;
    }

    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        list.innerHTML = goalsData[type].map(g => `
            <li class="goal-item" style="display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px dashed var(--frog-green);">
                <input type="checkbox" onchange="toggleGoal('${type}', ${g.id})" ${g.completed ? 'checked' : ''}>
                <span style="${g.completed ? 'text-decoration:line-through; color:var(--frog-green);' : ''}">${g.text}</span>
                <button onclick="deleteGoal('${type}', ${g.id})" style="margin-left:auto; background:none; border:none; cursor:pointer; color:var(--pond-pink); font-size:1.2rem;">×</button>
            </li>
        `).join('') || '<li style="font-size:0.8rem; color:var(--frog-green);">No hops yet...</li>';
        updateProgress(type);
    }

    function renderMasterHistory() {
        document.getElementById('moodHistoryList').innerHTML = [...goalsData.history.daily].reverse().map(h => `
            <div style="display:flex; align-items:center; gap:10px; font-size:0.8rem; margin-bottom:5px; color:white;">
                <span>${moodEmojis[h.mood]}</span><span>${h.text}</span>
            </div>
        `).join('') || '<span>None</span>';
        ['monthly', 'yearly'].forEach(type => {
            document.getElementById(`${type}HistoryList`).innerHTML = goalsData.history[type].map(h => `<div style="color:white; font-size:0.8rem;">${h.text}</div>`).join('');
        });
    }

    function loadGoals() {
        const saved = localStorage.getItem('ProgressPond_V2');
        if (saved) goalsData = JSON.parse(saved);
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory(); renderWater(); updateStreakUI();
        if (goalsData.currentMood) document.querySelector(`.mood-btn[data-mood="${goalsData.currentMood}"]`)?.classList.add('active');
    }

    function saveGoals() { localStorage.setItem('ProgressPond_V2', JSON.stringify(goalsData)); }
    function exportData() { const blob = new Blob([JSON.stringify(goalsData)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "PondBackup.json"; a.click(); }
    function importData(e) { const reader = new FileReader(); reader.onload = (ev) => { goalsData = JSON.parse(ev.target.result); saveGoals(); location.reload(); }; reader.readAsText(e.target.files); }
    function displayCurrentDate() { document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
    function updateStreakUI() { document.getElementById('streakCount').textContent = goalsData.streak; }
    window.deleteGoal = (type, id) => { goalsData[type] = goalsData[type].filter(g => g.id !== id); saveGoals(); renderGoals(type); };
})();
