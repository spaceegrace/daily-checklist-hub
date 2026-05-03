(() => {
    // 1. State Management (v3 with grouped history)
    let goalsData = {
        daily: [],
        monthly: [],
        yearly: [],
        history: { daily: [], monthly: [], yearly: [] }
    };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
    });

    function displayCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }

    function setupEventListeners() {
        const types = ['daily', 'monthly', 'yearly'];
        types.forEach(type => {
            const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
            
            const addBtn = document.getElementById(`add${capitalized}Btn`);
            if (addBtn) addBtn.addEventListener('click', () => addGoal(type));
            
            const inputField = document.getElementById(`${type}Input`);
            if (inputField) {
                inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') addGoal(type);
                });
            }
        });

        // Backup controls
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', exportData);
    }

    // 2. Persistent Storage Logic
    function loadGoals() {
        const saved = localStorage.getItem('GoalsHub_Persistent_v3');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure history structure exists
                if (!parsed.history) parsed.history = { daily: [], monthly: [], yearly: [] };
                goalsData = parsed;
            } catch (e) { console.error("Load failed", e); }
        }
        renderAllGoals();
        renderMasterHistory();
    }

    function saveGoals() {
        localStorage.setItem('GoalsHub_Persistent_v3', JSON.stringify(goalsData));
    }

    // 3. Goal Actions
    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        if (!input || !input.value.trim()) return;

        goalsData[type].push({
            id: Date.now(),
            text: input.value.trim(),
            completed: false
        });

        saveGoals();
        renderGoals(type);
        input.value = '';
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            
            if (goal.completed) {
                // Add to persistent history immediately
                goalsData.history[type].push({
                    text: goal.text,
                    timestamp: new Date().toLocaleString(),
                    id: Date.now()
                });
            }
            saveGoals();
            renderGoals(type);
            renderMasterHistory();
        }
    };

    window.deleteGoal = (type, id) => {
        goalsData[type] = goalsData[type].filter(g => g.id !== id);
        saveGoals();
        renderGoals(type);
    };

    // 4. Rendering UI
    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        
        list.innerHTML = goalsData[type].map(goal => `
            <li class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span>${escapeHtml(goal.text)}</span>
                <button onclick="deleteGoal('${type}', ${goal.id})">×</button>
            </li>
        `).join('') || '<li class="empty">No goals.</li>';
    }

    function renderAllGoals() {
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
    }

    // 5. The Master History Bar (Bottom Bar)
    function renderMasterHistory() {
        const historyContainer = document.getElementById('masterHistoryBar');
        if (!historyContainer) return;

        // Combine all histories for a "Total History" view
        const allHistory = [
            ...goalsData.history.daily.map(h => ({...h, cat: 'Daily'})),
            ...goalsData.history.monthly.map(h => ({...h, cat: 'Monthly'})),
            ...goalsData.history.yearly.map(h => ({...h, cat: 'Yearly'}))
        ].sort((a, b) => b.id - a.id); // Newest first

        if (allHistory.length === 0) {
            historyContainer.innerHTML = '<p class="empty-msg">Finished goals will appear here.</p>';
            return;
        }

        historyContainer.innerHTML = allHistory.map(h => `
            <div class="history-pill">
                <span class="pill-cat">${h.cat}</span>
                <span class="pill-text">${escapeHtml(h.text)}</span>
                <span class="pill-time">${h.timestamp}</span>
            </div>
        `).join('');
    }

    function exportData() {
        const blob = new Blob([JSON.stringify(goalsData)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'goals_history_backup.json';
        a.click();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
