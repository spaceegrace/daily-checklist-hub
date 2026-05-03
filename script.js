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
            document.getElementById(`${type}Input`)?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addGoal(type); });
        });

        document.getElementById('bannerClose')?.addEventListener('click', () => document.getElementById('backupBanner').classList.add('hidden'));
        
        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if(!['BUTTON', 'LABEL', 'INPUT'].includes(e.target.tagName)) {
                document.getElementById('historyFooter').classList.toggle('collapsed');
                document.getElementById('historyChevron').textContent = document.getElementById('historyFooter').classList.contains('collapsed') ? '▼' : '▲';
            }
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => exportData(true));
        document.getElementById('importFile')?.addEventListener('change', importData);
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            if(confirm("🐸 Ribbit? Clear all achievements?")) { goalsData.history = { daily: [], monthly: [], yearly: [] }; saveGoals(); renderMasterHistory(); }
        });
    }

    function loadGoals() {
        const saved = localStorage.getItem('GoalsHub_v6_Froggy');
        if (saved) goalsData = JSON.parse(saved);
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory();
        updateLilyPad();
    }

    function saveGoals() { localStorage.setItem('GoalsHub_v6_Froggy', JSON.stringify(goalsData)); }

    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        if (!input?.value.trim()) return;
        goalsData[type].push({ id: Date.now(), text: input.value.trim(), completed: false });
        saveGoals(); renderGoals(type); input.value = '';
        updateLilyPad();
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goalsData.history[type].push({ text: goal.text, id: Date.now(), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
            }
            saveGoals(); renderGoals(type); renderMasterHistory(); updateLilyPad();
        }
    };

    window.deleteGoal = (type, id) => {
        goalsData[type] = goalsData[type].filter(g => g.id !== id);
        saveGoals(); renderGoals(type); updateLilyPad();
    };

    window.deleteHistoryItem = (type, id) => {
        goalsData.history[type] = goalsData.history[type].filter(h => h.id !== id);
        saveGoals(); renderMasterHistory();
    };

    // --- Growing Animation Logic ---
    function updateLilyPad() {
        const dailyGoals = goalsData.daily;
        const completed = dailyGoals.filter(g => g.completed).length;
        const pad = document.getElementById('magicLilyPad');
        if (!pad) return;

        // Base size 60px, grows by 20px per completed goal
        const size = 60 + (completed * 25);
        // Gets brighter green as you finish goals
        const brightness = 100 + (completed * 10);
        
        pad.style.width = `${size}px`;
        pad.style.height = `${size}px`;
        pad.style.filter = `brightness(${brightness}%)`;
        pad.style.fontSize = `${1.5 + (completed * 0.2)}rem`;
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
        `).join('') || '<li style="color:#94a3b8; font-size:0.8rem;">No hops yet...</li>';
        updateProgress(type);
    }

    function updateProgress(type) {
        const goals = goalsData[type];
        const percent = goals.length ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) : 0;
        const bar = document.getElementById(`${type}Progress`);
        const text = document.getElementById(`${type}ProgressText`);
        if (bar) bar.style.width = percent + '%';
        if (text) text.textContent = percent + '%';
    }

    function renderMasterHistory() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const container = document.getElementById(`${type}HistoryList`);
            if (!container) return;
            container.innerHTML = [...goalsData.history[type]].reverse().map(h => `
                <div class="history-pill">
                    <span>${h.text}</span>
                    <button class="btn-hist-delete" onclick="deleteHistoryItem('${type}', ${h.id})">×</button>
                </div>
            `).join('') || '<span style="color:#64748b; font-size:0.7rem;">Empty</span>';
        });
    }

    function exportData(manual) {
        const blob = new Blob([JSON.stringify(goalsData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `FroggyHub_Backup.json`;
        a.click();
        if (manual) alert("Hops exported successfully! 🌸");
    }

    function importData(e) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try { goalsData = JSON.parse(event.target.result); saveGoals(); location.reload(); } catch(e) { alert("File error! Ribbit!"); }
        };
        reader.readAsText(e.target.files);
    }

    function displayCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
})();
