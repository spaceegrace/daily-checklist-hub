// Daily Goals Hub - Complete Updated Script
(() => {
    // 1. State Management with Categorized History
    let goalsData = {
        daily: [],
        monthly: [],
        yearly: [],
        history: {
            daily: [],
            monthly: [],
            yearly: []
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
    });

    function displayCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // 2. Event Listeners (Including New Export/Import)
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

        // History Filter & Clear
        document.getElementById('historyFilter').addEventListener('change', renderHistory);
        document.getElementById('clearHistoryBtn').addEventListener('click', clearAllHistory);

        // Data Management (The "Anti-Clear" features)
        document.getElementById('exportBtn').addEventListener('click', exportData);
        document.getElementById('importFile').addEventListener('change', importData);
    }

    // 3. Storage Logic (LocalStorage + Physical Backup support)
    function loadGoals() {
        const data = localStorage.getItem('goalsHub_v2');
        if (data) {
            goalsData = JSON.parse(data);
            // Migration check: Ensure history is an object if loading from old version
            if (Array.isArray(goalsData.history)) {
                goalsData.history = { daily: [], monthly: [], yearly: [] };
            }
        }
        renderAllGoals();
        renderHistory();
    }

    function saveGoals() {
        localStorage.setItem('goalsHub_v2', JSON.stringify(goalsData));
    }

    // 4. Core Goal Functions
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

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;

            if (goal.completed) {
                // Save to category-specific history
                goalsData.history[type].push({
                    id: Date.now(),
                    text: goal.text,
                    date: new Date().toISOString()
                });
            } else {
                // Remove from history if unchecked
                goalsData.history[type] = goalsData.history[type].filter(h => h.text !== goal.text);
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
        const msg = mode === 'completed' ? `Clear completed ${type} goals?` : `Clear ALL ${type} goals?`;
        if (!confirm(msg)) return;

        if (mode === 'completed') {
            goalsData[type] = goalsData[type].filter(g => !g.completed);
        } else {
            goalsData[type] = [];
        }
        saveGoals();
        renderGoals(type);
    }

    // 5. History Logic (Filtered by Section)
    function clearAllHistory() {
        const filter = document.getElementById('historyFilter').value;
        if (confirm(`Clear all ${filter} history?`)) {
            goalsData.history[filter] = [];
            saveGoals();
            renderHistory();
        }
    }

    // 6. Rendering Logic
    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        const goals = goalsData[type];
        
        if (goals.length === 0) {
            list.innerHTML = '<li class="empty-state">No goals yet. 🚀</li>';
            updateProgress(type, []);
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

    function renderHistory() {
        const list = document.getElementById('historyList');
        const filter = document.getElementById('historyFilter').value; // 'daily', 'monthly', or 'yearly'
        
        // Safety check for history object
        if (!goalsData.history[filter]) goalsData.history[filter] = [];
        
        let history = [...goalsData.history[filter]].reverse();

        if (history.length === 0) {
            list.innerHTML = `<li class="empty-state">No ${filter} history yet. 🎯</li>`;
            return;
        }

        list.innerHTML = history.map(h => `
            <li class="history-goal-item">
                <div class="history-info">
                    <span class="history-text">${escapeHtml(h.text)}</span>
                    <small class="history-date">${new Date(h.date).toLocaleDateString()}</small>
                </div>
                <span class="history-tag tag-${filter}">${filter}</span>
            </li>
        `).join('');
    }

    function renderAllGoals() {
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
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

    // 7. Data Portability (Anti-Clearance)
    function exportData() {
        const blob = new Blob([JSON.stringify(goalsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-goals-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                // Simple validation
                if (imported.daily && imported.history) {
                    goalsData = imported;
                    saveGoals();
                    renderAllGoals();
                    renderHistory();
                    alert('Data imported successfully!');
                }
            } catch (err) {
                alert('Invalid backup file.');
            }
        };
        reader.readAsText(file);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
