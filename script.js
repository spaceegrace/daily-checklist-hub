(() => {
    let goalsData = {
        daily: [], monthly: [], yearly: [],
        history: { daily: [], monthly: [], yearly: [] },
        lastBackup: null
    };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
        checkBackupReminder();
    });

    function setupEventListeners() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const cap = type.charAt(0).toUpperCase() + type.slice(1);
            document.getElementById(`add${cap}Btn`)?.addEventListener('click', () => addGoal(type));
            document.getElementById(`${type}Input`)?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addGoal(type); });
            document.getElementById(`clear${cap}CompletedBtn`)?.addEventListener('click', () => clearGoals(type));
        });

        document.getElementById('clearDailyAllBtn')?.addEventListener('click', () => { if(confirm("Clear all daily?")) { goalsData.daily = []; saveGoals(); renderGoals('daily'); }});

        // Toggle History
        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if(!['BUTTON', 'LABEL', 'INPUT'].includes(e.target.tagName)) {
                document.getElementById('historyFooter').classList.toggle('collapsed');
            }
        });

        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            if(confirm("Clear ALL achievement history?")) { goalsData.history = { daily: [], monthly: [], yearly: [] }; saveGoals(); renderMasterHistory(); }
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => exportData(true));
        document.getElementById('importFile')?.addEventListener('change', importData);
    }

    function loadGoals() {
        const saved = localStorage.getItem('GoalsHub_v5_Final');
        if (saved) {
            try { goalsData = JSON.parse(saved); } catch(e) {}
        }
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory();
    }

    function saveGoals() { localStorage.setItem('GoalsHub_v5_Final', JSON.stringify(goalsData)); }

    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        if (!input?.value.trim()) return;
        goalsData[type].push({ id: Date.now(), text: input.value.trim(), completed: false });
        saveGoals(); renderGoals(type); input.value = '';
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goalsData.history[type].push({ text: goal.text, id: Date.now(), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
            }
            saveGoals(); renderGoals(type); renderMasterHistory();
        }
    };

    window.deleteGoal = (type, id) => {
        goalsData[type] = goalsData[type].filter(g => g.id !== id);
        saveGoals(); renderGoals(type);
    };

    window.deleteHistoryItem = (type, id) => {
        goalsData.history[type] = goalsData.history[type].filter(h => h.id !== id);
        saveGoals(); renderMasterHistory();
    };

    function clearGoals(type) {
        goalsData[type] = goalsData[type].filter(g => !g.completed);
        saveGoals(); renderGoals(type);
    }

    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        list.innerHTML = goalsData[type].map(goal => `
            <li class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span>${goal.text}</span>
                <button class="btn-delete" onclick="deleteGoal('${type}', ${goal.id})">×</button>
            </li>
        `).join('') || '<li style="color:#94a3b8; font-size:0.8rem;">No goals yet...</li>';
        updateProgress(type);
    }

    function renderMasterHistory() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const container = document.getElementById(`${type}HistoryList`);
            if (!container) return;
            container.innerHTML = [...goalsData.history[type]].reverse().map(h => `
                <div class="history-pill">
                    <div><span class="pill-text">${h.text}</span><span class="pill-time">${h.time}</span></div>
                    <button class="btn-hist-delete" onclick="deleteHistoryItem('${type}', ${h.id})">×</button>
                </div>
            `).join('') || '<span style="color:#64748b; font-size:0.7rem;">Empty</span>';
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

    function checkBackupReminder() {
        const now = Date.now();
        if (!goalsData.lastBackup || (now - goalsData.lastBackup > 259200000)) {
            setTimeout(() => { if(confirm("🛡️ Time for a 3-day backup! Save your history?")) exportData(false); }, 2000);
        }
    }

    function exportData(manual) {
        goalsData.lastBackup = Date.now(); saveGoals();
        const blob = new Blob([JSON.stringify(goalsData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `GoalHub_Backup.json`; a.click();
        if (manual) alert("Backup saved!");
    }

    function importData(e) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try { goalsData = JSON.parse(event.target.result); saveGoals(); location.reload(); } catch(e) { alert("Invalid file"); }
        };
        reader.readAsText(e.target.files[0]);
    }

    function displayCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
})();
