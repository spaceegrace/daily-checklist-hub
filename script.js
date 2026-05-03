(() => {
    let goalsData = { 
        daily: [], monthly: [], yearly: [], history: { daily: [], monthly: [] }, 
        streak: 0, lastDate: null, currentMood: 'happy', zenActive: false, waterCount: 0,
        recentHops: 0 // Track hops for rest reminder
    };

    function setupEventListeners() {
        // ... (Existing listeners for mood, water, addBtn) ...

        // Jumpstart Logic
        document.getElementById('jumpstartBtn')?.addEventListener('click', () => {
            const incomplete = goalsData.daily.filter(g => !g.completed);
            if (incomplete.length === 0) return alert("No hops to jumpstart! 🐸");
            const randomGoal = incomplete[Math.floor(Math.random() * incomplete.length)];
            alert(`🌅 Focus on this hop first: "${randomGoal.text}"`);
            renderGoals('daily', randomGoal.id); // Pass ID to highlight
        });
    }

    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        const energy = document.getElementById('energyLevel')?.value || 'high';
        if (!input?.value.trim()) return;

        goalsData[type].push({ 
            id: Date.now(), 
            text: input.value.trim(), 
            completed: false, 
            isBigFrog: false,
            energy: energy 
        });
        
        saveGoals();
        renderGoals(type);
        input.value = '';
    }

    // Toggle "Big Frog" Status
    window.makeBigFrog = (id) => {
        goalsData.daily.forEach(g => {
            if(g.id === id) g.isBigFrog = !g.isBigFrog;
            else g.isBigFrog = false; // Only one Big Frog allowed
        });
        saveGoals();
        renderGoals('daily');
    };

    function renderGoals(type, highlightId = null) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;

        // Auto-Sort: Big Frog first, then sort by Mood/Energy
        let goals = [...goalsData[type]];
        if (type === 'daily') {
            goals.sort((a, b) => {
                if (a.isBigFrog) return -1;
                if (b.isBigFrog) return 1;
                // If Tired Froggy, move Low Energy to top
                if (goalsData.currentMood === 'tired') {
                    if (a.energy === 'low' && b.energy === 'high') return -1;
                    if (a.energy === 'high' && b.energy === 'low') return 1;
                }
                return 0;
            });
        }

        list.innerHTML = goals.map(goal => `
            <li class="goal-item ${goal.isBigFrog ? 'big-frog' : ''} ${goal.id === highlightId ? 'jumpstart-focus' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span style="${goal.completed ? 'text-decoration:line-through' : ''}">${goal.text}</span>
                <div style="margin-left:auto; display:flex; gap:10px;">
                    ${type === 'daily' ? `<button class="btn-crown" onclick="makeBigFrog(${goal.id})">${goal.isBigFrog ? '👑' : '⚪'}</button>` : ''}
                    <button class="btn-delete" onclick="deleteGoal('${type}', ${goal.id})">×</button>
                </div>
            </li>
        `).join('');
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                // Rest Reminder Logic
                goalsData.recentHops++;
                if (goalsData.recentHops >= 3) {
                    showRestReminder();
                    goalsData.recentHops = 0;
                }
                // (Existing history/streak logic here)
            }
            saveGoals(); renderGoals(type);
        }
    };

    function showRestReminder() {
        const div = document.createElement('div');
        div.className = 'rest-popup';
        div.innerHTML = `<h3>☕ Time for a rest!</h3><p>You've finished 3 hops in a row. Take 5 minutes to breathe?</p><button class="btn btn-primary" onclick="this.parentElement.remove()">Okay! 🐸</button>`;
        document.body.appendChild(div);
    }

    // ... (Keep existing load/save/export/water/mood functions)
})();
