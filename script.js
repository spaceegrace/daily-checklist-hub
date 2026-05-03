(() => {
    let goalsData = {
        daily: [], monthly: [], yearly: [],
        history: { daily: [], monthly: [], yearly: [] }
    };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
    });

    function setupEventListeners() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const cap = type.charAt(0).toUpperCase() + type.slice(1);
            document.getElementById(`add${cap}Btn`)?.addEventListener('click', () => addGoal(type));
            document.getElementById(`${type}Input`)?.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') addGoal(type); 
            });
        });

        // Banner Controls
        document.getElementById('bannerClose')?.addEventListener('click', () => {
            document.getElementById('backupBanner').classList.add('hidden');
        });

        // History Toggle Logic
        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if(!['BUTTON', 'LABEL', 'INPUT'].includes(e.target.tagName)) {
                document.getElementById('historyFooter').classList.toggle('collapsed');
            }
        });

        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            if(confirm("🐸 Ribbit? Are you sure you want to clear all achievements?")) { 
                goalsData.history = { daily: [], monthly: [], yearly: [] }; 
                saveGoals(); renderMasterHistory(); 
            }
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => exportData(true));
        document.getElementById('importFile')?.addEventListener('change', importData);
    }

    function loadGoals() {
        const saved = localStorage.getItem('GoalsHub_v5_Final');
        if (saved) {
            try { goalsData = JSON.parse(saved); } catch(e) { console.error("Ribbit! Load failed"); }
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
                goalsData.history[type].push({ 
                    text: goal.text, id: Date.now(), 
                    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                });
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

    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        list.innerHTML = goalsData[type].map(goal => `
            <li class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span>${escapeHtml(goal.text)}</span>
                <button class="btn-delete" onclick="deleteGoal('${type}', ${goal.id})">×</button>
            </li>
        `).join('') || '<li style="color:#94a3b8; font-size:0.8rem; padding:10px 0;">No hops yet... 🐸</li>';
        updateProgress(type);
    }

    function renderMasterHistory() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const container = document.getElementById(`${type}HistoryList`);
            if (!container) return;
            container.innerHTML = [...goalsData.history[type]].reverse().map(h => `
                <div class="history-pill">
                    <div><span class="pill-text">${escapeHtml(h.text)}</span><span class="pill-time">${h.time}</span></div>
                    <button class="btn-hist-delete" onclick="deleteHistoryItem('${type}', ${h.id})">×</button>
                </div>
            `).join('') || '<span style="color:#64748b; font-size:0.7rem;">Empty pond</span>';
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

    function exportData(manual) {
        const blob = new Blob([JSON.stringify(goalsData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `FroggyBackup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        if (manual) alert("Yay! Your hops are safe in a backup file! 🌸");
    }

    function importData(e) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try { goalsData = JSON.parse(event.target.result); saveGoals(); location.reload(); } catch(e) { alert("Oh no! That file isn't ribbiting correctly."); }
        };
        reader.readAsText(e.target.files);
    }

    function displayCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
