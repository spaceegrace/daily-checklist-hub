(() => {
    // 1. State Management (v4 with grouped history & backup tracking)
    let goalsData = {
        daily: [],
        monthly: [],
        yearly: [],
        history: { daily: [], monthly: [], yearly: [] },
        lastBackup: null
    };

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
        checkBackupReminder();
    });

    function displayCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // 2. Setup Event Listeners
    function setupEventListeners() {
        const types = ['daily', 'monthly', 'yearly'];
        
        types.forEach(type => {
            const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
            
            // Add Button
            const addBtn = document.getElementById(`add${capitalized}Btn`);
            if (addBtn) addBtn.addEventListener('click', () => addGoal(type));
            
            // Enter Key
            const input = document.getElementById(`${type}Input`);
            if (input) input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addGoal(type);
            });

            // Clear Completed
            const clearBtn = document.getElementById(`clear${capitalized}CompletedBtn`);
            if (clearBtn) clearBtn.addEventListener('click', () => clearGoals(type));
        });

        // Clear All Daily
        const clearDailyAll = document.getElementById('clearDailyAllBtn');
        if (clearDailyAll) clearDailyAll.addEventListener('click', () => {
            if(confirm("Clear all daily goals?")) {
                goalsData.daily = [];
                saveGoals();
                renderGoals('daily');
            }
        });

        // Subtle Clear History Button
        const clearHistBtn = document.getElementById('clearHistoryBtn');
        if (clearHistBtn) clearHistBtn.addEventListener('click', () => {
            if (confirm("Permanently delete your achievement history?")) {
                goalsData.history = { daily: [], monthly: [], yearly: [] };
                saveGoals();
                renderMasterHistory();
            }
        });

        // Backup/Restore
        if (document.getElementById('exportBtn')) document.getElementById('exportBtn').addEventListener('click', () => exportData(true));
        if (document.getElementById('importFile')) document.getElementById('importFile').addEventListener('change', importData);
    }

    // 3. Storage Logic
    function loadGoals() {
        const saved = localStorage.getItem('GoalsHub_Permanent_v4');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (!parsed.history) parsed.history = { daily: [], monthly: [], yearly: [] };
                goalsData = parsed;
            } catch (e) { console.error("Load failed"); }
        }
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory();
    }

    function saveGoals() {
        localStorage.setItem('GoalsHub_Permanent_v4', JSON.stringify(goalsData));
    }

    // 4. Core Goal Logic
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
                // Add to persistent history
                goalsData.history[type].push({
                    text: goal.text,
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    date: new Date().toLocaleDateString(),
                    id: Date.now()
                });
            } else {
                // Optional: Remove from history if unchecked
                goalsData.history[type] = goalsData.history[type].filter(h => h.text !== goal.text);
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

    function clearGoals(type) {
        goalsData[type] = goalsData[type].filter(g => !g.completed);
        saveGoals();
        renderGoals(type);
    }

    // 5. Rendering
    function renderGoals(type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;

        list.innerHTML = goalsData[type].map(goal => `
            <li class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span class="goal-text">${goal.text}</span>
                <button class="btn-delete" onclick="deleteGoal('${type}', ${goal.id})">×</button>
            </li>
        `).join('') || '<li class="empty-state">No goals yet.</li>';

        updateProgress(type);
    }

    function updateProgress(type) {
        const bar = document.getElementById(`${type}Progress`);
        const text = document.getElementById(`${type}ProgressText`);
        if (!bar || !text) return;

        const goals = goalsData[type];
        const percent = goals.length ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) : 0;
        bar.style.width = percent + '%';
        text.textContent = percent + '%';
    }

    function renderMasterHistory() {
        const container = document.getElementById('masterHistoryBar');
        if (!container) return;

        const all = [
            ...goalsData.history.daily.map(h => ({...h, cat: 'Daily'})),
            ...goalsData.history.monthly.map(h => ({...h, cat: 'Monthly'})),
            ...goalsData.history.yearly.map(h => ({...h, cat: 'Yearly'}))
        ].sort((a, b) => b.id - a.id);

        container.innerHTML = all.map(h => `
            <div class="history-pill">
                <span class="pill-cat">${h.cat}</span>
                <span class="pill-text">${h.text}</span>
                <span class="pill-time">${h.date} | ${h.time}</span>
            </div>
        `).join('') || '<span style="color:#64748b; font-size:0.8rem;">Finished goals will appear here...</span>';
    }

    // 6. Permanence & Backup Reminders
    function checkBackupReminder() {
        const now = Date.now();
        const frequencyMs = 259200000; // 3 Days
        
        if (!goalsData.lastBackup || (now - goalsData.lastBackup > frequencyMs)) {
            setTimeout(() => {
                const msg = "🛡️ Secure Your Progress: It's time for your scheduled backup! Keep your history safe from browser clears by downloading a backup now.";
                if (confirm(msg)) {
                    exportData(false);
                }
            }, 2000);
        }
    }

    function exportData(manualTrigger = true) {
        goalsData.lastBackup = Date.now();
        saveGoals();
        
        const dataStr = JSON.stringify(goalsData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `GoalsHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        if (manualTrigger) alert("Backup Downloaded!");
    }

    function importData(e) {
        const file = e.target.files;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.history && imported.daily) {
                    goalsData = imported;
                    saveGoals();
                    location.reload();
                } else {
                    alert("Invalid backup file structure.");
                }
            } catch (err) { alert("Error reading backup file."); }
        };
        reader.readAsText(file[0]);
    }
})();
