// Daily Goals Hub - Final Robust Version
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
        loadGoals(); // This also triggers renderAllGoals and renderHistory
        setupEventListeners();
    });

    function displayCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (!dateElement) return;
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // 2. Optimized & Safe Event Listeners
    function setupEventListeners() {
        const types = ['daily', 'monthly', 'yearly'];
        
        types.forEach(type => {
            const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
            
            // Add Button
            const addBtn = document.getElementById(`add${capitalized}Btn`);
            if (addBtn) addBtn.addEventListener('click', () => addGoal(type));
            
            // Enter Key on Input
            const inputField = document.getElementById(`${type}Input`);
            if (inputField) {
                inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') addGoal(type);
                });
            }

            // Clear Completed Button
            const clearCompBtn = document.getElementById(`clear${capitalized}CompletedBtn`);
            if (clearCompBtn) clearCompBtn.addEventListener('click', () => clearGoals(type, 'completed'));
        });

        // Other UI Controls
        const clearDailyAll = document.getElementById('clearDailyAllBtn');
        if (clearDailyAll) clearDailyAll.addEventListener('click', () => clearGoals('daily', 'all'));

        const histFilter = document.getElementById('historyFilter');
        if (histFilter) histFilter.addEventListener('change', renderHistory);

        const clearHistBtn = document.getElementById('clearHistoryBtn');
        if (clearHistBtn) clearHistBtn.addEventListener('click', clearAllHistory);

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', exportData);

        const importInput = document.getElementById('importFile');
        if (importInput) importInput.addEventListener('change', importData);
    }

    // 3. Storage Logic (v2 supports per-section history)
    function loadGoals() {
        const data = localStorage.getItem('goalsHub_v2');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                // Basic migration: Ensure history is the new object format
                if (parsed && typeof parsed.history === 'object' && !Array.isArray(parsed.history)) {
                    goalsData = parsed;
                }
            } catch (e) {
                console.error("Error parsing stored data", e);
            }
        }
        renderAllGoals();
        renderHistory();
    }

    function saveGoals() {
        localStorage.setItem('goalsHub_v2', JSON.stringify(goalsData));
    }

    // 4. Core Goal Logic
    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        if (!input) return;

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
                if (!goalsData.history[type]) goalsData.history[type] = [];
                goalsData.history[type].push({
                    id: Date.now(),
                    text: goal.text,
                    date: new Date().toISOString()
                });
            } else {
                // If unchecked, remove from history (optional logic)
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

    function clearAllHistory() {
        const filterEl = document.getElementById('historyFilter');
        const filter = filterEl ? filterEl.value : 'daily';
        if (confirm(`Clear all ${filter} history?`)) {
            goalsData.history[filter] = [];
            saveGoals();
            renderHistory();
        }
    }

    // 5. Rendering Logic
    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;

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
        if (!list) return;

        const filterEl = document.getElementById('historyFilter');
        const filter = filterEl ? filterEl.value : 'daily'; 
        
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
        if (!progress || !text) return;

        if (!goals || goals.length === 0) {
            progress.style.width = '0%';
            text.textContent = '0%';
            return;
        }
        const percent = Math.round((goals.filter(g => g.completed).length / goals.length) * 100);
        progress.style.width = `${percent}%`;
        text.textContent = `${percent}%`;
    }

    // 6. Data Portability (Survivability)
    function exportData() {
        const blob = new Blob([JSON.stringify(goalsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goals-backup-${new Date().toISOString().split('T')[0]}.json`;
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
                if (imported.daily && imported.history) {
                    goalsData = imported;
                    saveGoals();
                    renderAllGoals();
                    renderHistory();
                    alert('Data restored successfully!');
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
