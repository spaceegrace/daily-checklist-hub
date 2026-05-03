// Daily Goals Hub - Updated Full Script
(() => {
    // 1. State Management with Section-Specific History
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
        if (dateElement) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }

    // 2. Safe Event Listeners (Checks if elements exist)
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

            const clearBtn = document.getElementById(`clear${capitalized}CompletedBtn`);
            if (clearBtn) clearBtn.addEventListener('click', () => clearGoals(type));
        });

        const histFilter = document.getElementById('historyFilter');
        if (histFilter) histFilter.addEventListener('change', renderHistory);
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', exportData);
        
        const importInput = document.getElementById('importFile');
        if (importInput) importInput.addEventListener('change', importData);
    }

    // 3. Storage Logic
    function loadGoals() {
        const data = localStorage.getItem('goalsHub_v2');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                // Basic check to ensure history is formatted correctly
                if (parsed && typeof parsed.history === 'object' && !Array.isArray(parsed.history)) {
                    goalsData = parsed;
                }
            } catch (e) { console.error("Load failed", e); }
        }
        renderAllGoals();
        renderHistory();
    }

    function saveGoals() {
        localStorage.setItem('goalsHub_v2', JSON.stringify(goalsData));
    }

    // 4. Core Goal Actions
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
            
            // Log to the specific category history
            if (goal.completed) {
                if (!goalsData.history[type]) goalsData.history[type] = [];
                goalsData.history[type].push({
                    text: goal.text,
                    date: new Date().toISOString()
                });
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

    function clearGoals(type) {
        if (!confirm(`Clear completed ${type} goals?`)) return;
        goalsData[type] = goalsData[type].filter(g => !g.completed);
        saveGoals();
        renderGoals(type);
    }

    // 5. Rendering (Null-Safe)
    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        
        const goals = goalsData[type];
        if (goals.length === 0) {
            list.innerHTML = '<li class="empty-state">No goals yet. 🚀</li>';
            return;
        }

        list.innerHTML = goals.map(goal => `
            <li class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span class="goal-text">${goal.text}</span>
                <button onclick="deleteGoal('${type}', ${goal.id})">Delete</button>
            </li>
        `).join('');
    }

    function renderAllGoals() {
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
    }

    function renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;

        const filterEl = document.getElementById('historyFilter');
        const filter = filterEl ? filterEl.value : 'daily'; // Fallback if missing
        
        let history = [...(goalsData.history[filter] || [])].reverse();
        if (history.length === 0) {
            list.innerHTML = `<li class="empty-state">No ${filter} history.</li>`;
            return;
        }

        list.innerHTML = history.map(h => `
            <li class="history-item">
                <span>${h.text}</span>
                <small>${new Date(h.date).toLocaleDateString()}</small>
            </li>
        `).join('');
    }

    // 6. Data Persistence (Export/Import)
    function exportData() {
        const blob = new Blob([JSON.stringify(goalsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goals_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
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
                    location.reload(); // Refresh to apply changes
                }
            } catch (err) { alert('Invalid backup file.'); }
        };
        reader.readAsText(file);
    }
})();
