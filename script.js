// Daily Goals Hub - JavaScript
(() => {
    // 1. State Management (Private scope instead of window)
    let goalsData = { daily: [], monthly: [], yearly: [], history: [] };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
        renderHistory();
    });

    function displayCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // 2. Optimized Event Listeners (DRY)
    function setupEventListeners() {
        const types = ['daily', 'monthly', 'yearly'];
        
        types.forEach(type => {
            const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
            
            // Add Button
            document.getElementById(`add${capitalized}Btn`).addEventListener('click', () => addGoal(type));
            
            // Enter Key
            document.getElementById(`${type}Input`).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addGoal(type);
            });

            // Clear Completed
            document.getElementById(`clear${capitalized}CompletedBtn`).addEventListener('click', () => clearGoals(type, 'completed'));
        });

        // Specific Daily "Clear All"
        document.getElementById('clearDailyAllBtn').addEventListener('click', () => clearGoals('daily', 'all'));

        // History
        document.getElementById('historyFilter').addEventListener('change', renderHistory);
        document.getElementById('clearHistoryBtn').addEventListener('click', clearAllHistory);
    }

    function loadGoals() {
        const data = localStorage.getItem('goalsHub');
        if (data) goalsData = JSON.parse(data);
        renderAllGoals();
    }

    function saveGoals() {
        localStorage.setItem('goalsHub', JSON.stringify(goalsData));
    }

    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        const text = input.value.trim();
        if (!text) return alert('Please enter a goal!');

        goalsData[type].push({
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        });

        saveGoals();
        renderGoals(type);
        input.value = '';
        input.focus();
    }

    // 3. Improved Logic: Toggle and History
    window.toggleGoal = (type, id) => { // Exposed to window for HTML onclicks
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            
            // Only add to history when checked (prevents duplicates during clear)
            if (goal.completed && type === 'daily') {
                addToHistory(goal.text, true);
            } else if (!goal.completed && type === 'daily') {
                // Remove from history if unchecked
                goalsData.history = goalsData.history.filter(h => h.text !== goal.text || h.completed === false);
            }
            
            saveGoals();
            renderGoals(type);
            renderHistory();
        }
    };

    window.deleteGoal = (type, id) => {
        goalsData[type] = goalsData[type].filter(g => g.id !== id);
        saveGoals();
        renderGoals(type);
    };

    function clearGoals(type, mode) {
        const msg = mode === 'completed' ? 'Clear completed goals?' : 'Clear ALL goals?';
        if (!confirm(msg)) return;

        if (mode === 'completed') {
            goalsData[type] = goalsData[type].filter(g => !g.completed);
        } else {
            goalsData[type] = [];
        }

        saveGoals();
        renderGoals(type);
    }

    function addToHistory(goalText, completed) {
        goalsData.history.push({
            id: Date.now(),
            text: goalText,
            completed: completed,
            date: new Date().toISOString()
        });
    }

    function clearAllHistory() {
        if (confirm('Clear all history?')) {
            goalsData.history = [];
            saveGoals();
            renderHistory();
        }
    }

    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        const goals = goalsData[type];

        if (goals.length === 0) {
            list.innerHTML = '<li class="empty-state">No goals yet. 🚀</li>';
            updateProgress(type, 0);
            return;
        }

        list.innerHTML = goals.map(goal => `
            <li class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''} 
                    onchange="toggleGoal('${type}', ${goal.id})">
                <span class="goal-text">${escapeHtml(goal.text)}</span>
                <button class="goal-delete" onclick="deleteGoal('${type}', ${goal.id})">Delete</button>
            </li>
        `).join('');
        
        updateProgress(type, goals);
    }

    function updateProgress(type, goals) {
        const progress = document.getElementById(`${type}Progress`);
        const text = document.getElementById(`${type}ProgressText`);
        
        if (!goals || goals.length === 0) {
            progress.style.width = '0%';
            text.textContent = '0%';
            return;
        }

        const percent = Math.round((goals.filter(g => g.completed).length / goals.length) * 100);
        progress.style.width = `${percent}%`;
        text.textContent = `${percent}%`;
    }

    function renderAllGoals() {
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
    }

    function renderHistory() {
        const list = document.getElementById('historyList');
        const filter = document.getElementById('historyFilter').value;
        let history = [...goalsData.history].reverse();

        if (history.length === 0) {
            list.innerHTML = '<li class="empty-state">No history yet. 🎯</li>';
            return;
        }

        // Simple Filter Logic
        const now = new Date();
        if (filter !== 'all') {
            const days = filter === 'today' ? 1 : filter === 'week' ? 7 : 30;
            const limit = new Date(now.setDate(now.getDate() - days));
            history = history.filter(h => new Date(h.date) >= limit);
        }

        // Render grouping (Simplified)
        list.innerHTML = history.map(h => `
            <li class="history-goal-item">
                <span>${escapeHtml(h.text)}</span>
                <small>${new Date(h.date).toLocaleDateString()}</small>
            </li>
        `).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
