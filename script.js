(() => {
    // 1. State Management
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

    const STORAGE_KEY = 'GoalsHub_Persistent_Data';

    // 2. Initialize
    document.addEventListener('DOMContentLoaded', () => {
        initDate();
        loadData();
        setupEventListeners();
    });

    function initDate() {
        const dateEl = document.getElementById('currentDate');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // 3. Core Logic
    function setupEventListeners() {
        // Goal Inputs & Buttons
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const capType = type.charAt(0).toUpperCase() + type.slice(1);
            
            // Add click
            document.getElementById(`add${capType}Btn`).onclick = () => addGoal(type);
            
            // Add via Enter Key
            document.getElementById(`${type}Input`).onkeydown = (e) => {
                if (e.key === 'Enter') addGoal(type);
            };
        });

        // Banner Controls
        document.getElementById('bannerClose').onclick = () => {
            document.getElementById('backupBanner').classList.add('hidden');
        };
        document.getElementById('bannerExportBtn').onclick = () => exportData();

        // History Drawer Toggle
        document.getElementById('historyToggle').onclick = (e) => {
            // Prevent toggle if clicking buttons inside the header
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'LABEL') return;
            document.getElementById('historyFooter').classList.toggle('collapsed');
        };

        // Data Management
        document.getElementById('exportBtn').onclick = exportData;
        document.getElementById('importFile').onchange = importData;
        document.getElementById('clearHistoryBtn').onclick = clearAllHistory;
    }

    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        const text = input.value.trim();
        
        if (!text) return;

        const newGoal = {
            id: Date.now(),
            text: text,
            createdAt: new Date().toISOString()
        };

        goalsData[type].push(newGoal);
        input.value = '';
        saveAndRender();
    }

    window.toggleGoal = (type, id) => {
        const index = goalsData[type].findIndex(g => g.id === id);
        if (index > -1) {
            const completedGoal = goalsData[type].splice(index, 1)[0];
            
            // Move to history
            goalsData.history[type].push({
                ...completedGoal,
                completedAt: new Date().toISOString(),
                timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            saveAndRender();
        }
    };

    window.deleteActiveGoal = (type, id) => {
        goalsData[type] = goalsData[type].filter(g => g.id !== id);
        saveAndRender();
    };

    window.deleteHistoryItem = (type, id) => {
        goalsData.history[type] = goalsData.history[type].filter(h => h.id !== id);
        saveAndRender();
    };

    function clearAllHistory() {
        if (confirm("Permanently delete all achievement history?")) {
            goalsData.history = { daily: [], monthly: [], yearly: [] };
            saveAndRender();
        }
    }

    // 4. Persistence
    function saveAndRender() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goalsData));
        renderAll();
    }

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Simple migration/merge for safety
                goalsData = { ...goalsData, ...parsed };
            } catch (e) {
                console.error("Data corrupted, starting fresh.");
            }
        }
        renderAll();
    }

    // 5. Rendering
    function renderAll() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            renderActiveList(type);
            renderHistoryList(type);
            updateProgress(type);
        });
    }

    function renderActiveList(type) {
        const list = document.getElementById(`${type}List`);
        list.innerHTML = goalsData[type].map(goal => `
            <li class="goal-item">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})">
                <span>${escapeHtml(goal.text)}</span>
                <button class="btn-delete" onclick="deleteActiveGoal('${type}', ${goal.id})">×</button>
            </li>
        `).join('');
    }

    function renderHistoryList(type) {
        const list = document.getElementById(`${type}HistoryList`);
        // Show newest first
        const history = [...goalsData.history[type]].reverse();
        
        list.innerHTML = history.map(item => `
            <div class="history-pill">
                <div class="history-info">
                    <span class="pill-text">${escapeHtml(item.text)}</span>
                    <span class="pill-time">${item.timeStr || ''}</span>
                </div>
                <button class="btn-hist-delete" onclick="deleteHistoryItem('${type}', ${item.id})">×</button>
            </div>
        `).join('');
    }

    function updateProgress(type) {
        // Since goals disappear when completed, we use history count for progress
        // Note: This logic assumes daily reset, or total session progress
        const active = goalsData[type].length;
        const finished = goalsData.history[type].length;
        const total = active + finished;
        const percent = total === 0 ? 0 : Math.round((finished / total) * 100);

        const bar = document.getElementById(`${type}Progress`);
        const text = document.getElementById(`${type}ProgressText`);
        
        if (bar) bar.style.width = `${percent}%`;
        if (text) text.textContent = `${percent}%`;
    }

    // 6. Data Portability
    function exportData() {
        const dataStr = JSON.stringify(goalsData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Goals_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.history) {
                    goalsData = imported;
                    saveAndRender();
                    alert("Data restored successfully!");
                }
            } catch (err) {
                alert("Invalid backup file.");
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
