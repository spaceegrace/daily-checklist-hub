(() => {
    let goalsData = { daily: [], monthly: [], history: { daily: [] }, streak: 0, lastDate: null, currentMood: 'happy', waterCount: 0 };
    const moodEmojis = { happy: "😊", calm: "😌", focused: "🧐", tired: "😴" };

    document.addEventListener('DOMContentLoaded', () => {
        displayDate(); load(); events();
    });

    function events() {
        ['daily', 'monthly'].forEach(type => {
            const cap = type.charAt(0).toUpperCase() + type.slice(1);
            document.getElementById(`add${cap}Btn`).onclick = () => add(type);
            document.getElementById(`${type}Input`).onkeydown = (e) => { if(e.key==='Enter') add(type); };
        });

        document.getElementById('drawerToggle').onclick = () => document.getElementById('sideDrawer').classList.add('open');
        document.getElementById('drawerClose').onclick = () => document.getElementById('sideDrawer').classList.remove('open');

        document.getElementById('historyToggle').onclick = () => {
            const footer = document.getElementById('historyFooter');
            footer.classList.toggle('collapsed');
            document.getElementById('historyToggle').textContent = footer.classList.contains('collapsed') ? 'Achievement Bar ▼' : 'Achievement Bar ▲';
        };

        document.getElementById('exportBtn').onclick = exportData;
        document.getElementById('importFile').onchange = importData;
    }

    function add(type) {
        const input = document.getElementById(`${type}Input`);
        if(!input.value.trim()) return;
        goalsData[type].push({ id: Date.now(), text: input.value.trim() });
        save(); render(type); input.value = '';
    }

    // UX Feature: Goal disappears after completion
    window.toggle = (type, id) => {
        const idx = goalsData[type].findIndex(g => g.id === id);
        if(idx > -1) {
            const item = goalsData[type].splice(idx, 1)[0]; // Remove from list
            const log = { text: item.text, id: Date.now(), mood: goalsData.currentMood, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
            
            if(type === 'daily') {
                goalsData.history.daily.push(log);
                updateStreak();
            }
            save(); render(type); renderHistory();
        }
    };

    function render(type) {
        const list = document.getElementById(`${type}List`);
        list.innerHTML = goalsData[type].map(g => `
            <li class="hop-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <input type="checkbox" onchange="toggle('${type}', ${g.id})">
                <span>${g.text}</span>
            </li>
        `).join('') || '<li style="color:#67a36a; font-size:0.8rem;">No active hops...</li>';
        updateProgress();
    }

    function renderHistory() {
        document.getElementById('moodHistoryList').innerHTML = [...goalsData.history.daily].reverse().map(h => `
            <div style="font-size:0.8rem; margin-bottom:4px; color:white;">${moodEmojis[h.mood] || '🐸'} ${h.text}</div>
        `).join('') || '<span>-</span>';
        document.getElementById('streakCount').textContent = goalsData.streak;
    }

    function save() { localStorage.setItem('Pond_Final_UX', JSON.stringify(goalsData)); }
    function load() {
        const s = localStorage.getItem('Pond_Final_UX');
        if(s) goalsData = JSON.parse(s);
        ['daily', 'monthly'].forEach(render);
        renderHistory();
    }

    function displayDate() { document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}); }

    // Export/Import logic goes here...
})();
