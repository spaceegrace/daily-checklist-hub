// Daily Goals Hub - JavaScript

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();
    loadGoals();
    setupEventListeners();
    renderHistory();
});

// Display Current Date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Setup Event Listeners
function setupEventListeners() {
    // Daily Goals
    document.getElementById('addDailyBtn').addEventListener('click', () => addGoal('daily'));
    document.getElementById('dailyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoal('daily');
    });
    document.getElementById('clearDailyCompletedBtn').addEventListener('click', () => clearGoals('daily', 'completed'));
    document.getElementById('clearDailyAllBtn').addEventListener('click', () => clearGoals('daily', 'all'));

    // Monthly Goals
    document.getElementById('addMonthlyBtn').addEventListener('click', () => addGoal('monthly'));
    document.getElementById('monthlyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoal('monthly');
    });
    document.getElementById('clearMonthlyCompletedBtn').addEventListener('click', () => clearGoals('monthly', 'completed'));

    // Yearly Goals
    document.getElementById('addYearlyBtn').addEventListener('click', () => addGoal('yearly'));
    document.getElementById('yearlyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoal('yearly');
    });
    document.getElementById('clearYearlyCompletedBtn').addEventListener('click', () => clearGoals('yearly', 'completed'));

    // History
    document.getElementById('historyFilter').addEventListener('change', renderHistory);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearAllHistory);
}

// Data Management
function loadGoals() {
    const data = localStorage.getItem('goalsHub');
    if (data) {
        window.goalsData = JSON.parse(data);
    } else {
        window.goalsData = {
            daily: [],
            monthly: [],
            yearly: [],
            history: []
        };
    }
    renderAllGoals();
}

function saveGoals() {
    localStorage.setItem('goalsHub', JSON.stringify(window.goalsData));
}

// Add Goal
function addGoal(type) {
    const inputElement = document.getElementById(`${type}Input`);
    const goalText = inputElement.value.trim();

    if (goalText === '') {
        alert('Please enter a goal!');
        return;
    }

    const newGoal = {
        id: Date.now(),
        text: goalText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    window.goalsData[type].push(newGoal);
    saveGoals();
    renderGoals(type);
    inputElement.value = '';
    inputElement.focus();
}

// Toggle Goal Completion
function toggleGoal(type, id) {
    const goal = window.goalsData[type].find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        
        // Add to history if completed
        if (goal.completed && type === 'daily') {
            addToHistory(goal.text, true);
        }
        
        saveGoals();
        renderGoals(type);
        renderHistory();
    }
}

// Delete Goal
function deleteGoal(type, id) {
    window.goalsData[type] = window.goalsData[type].filter(g => g.id !== id);
    saveGoals();
    renderGoals(type);
}

// Clear Goals
function clearGoals(type, mode) {
    if (mode === 'completed') {
        if (!confirm('Clear all completed goals?')) return;
        // Add incomplete goals to history before clearing
        const completedGoals = window.goalsData[type].filter(g => g.completed);
        if (type === 'daily') {
            completedGoals.forEach(goal => {
                addToHistory(goal.text, true);
            });
        }
        window.goalsData[type] = window.goalsData[type].filter(g => !g.completed);
    } else if (mode === 'all') {
        if (!confirm('Clear ALL goals? This cannot be undone!')) return;
        window.goalsData[type] = [];
    }
    saveGoals();
    renderGoals(type);
    renderHistory();
}

// History Management
function addToHistory(goalText, completed) {
    const historyEntry = {
        id: Date.now(),
        text: goalText,
        completed: completed,
        date: new Date().toISOString(),
        dateOnly: new Date().toDateString()
    };
    
    if (!window.goalsData.history) {
        window.goalsData.history = [];
    }
    
    window.goalsData.history.push(historyEntry);
    saveGoals();
}

function clearAllHistory() {
    if (!confirm('Clear all history? This cannot be undone!')) return;
    window.goalsData.history = [];
    saveGoals();
    renderHistory();
}

// Render Goals
function renderGoals(type) {
    const listElement = document.getElementById(`${type}List`);
    const goals = window.goalsData[type];

    if (goals.length === 0) {
        listElement.innerHTML = '<li class="empty-state">No goals yet. Add one to get started! 🚀</li>';
        updateProgress(type, 0);
        return;
    }

    listElement.innerHTML = goals.map(goal => `
        <li class="goal-item ${goal.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="goal-checkbox"
                ${goal.completed ? 'checked' : ''}
                onchange="toggleGoal('${type}', ${goal.id})"
            >
            <span class="goal-text">${escapeHtml(goal.text)}</span>
            <button class="goal-delete" onclick="deleteGoal('${type}', ${goal.id})">Delete</button>
        </li>
    `).join('');

    updateProgress(type, goals);
}

// Update Progress
function updateProgress(type, goals) {
    if (typeof goals === 'number') {
        // Handle empty state
        document.getElementById(`${type}Progress`).style.width = '0%';
        document.getElementById(`${type}ProgressText`).textContent = '0%';
        return;
    }

    const completed = goals.filter(g => g.completed).length;
    const total = goals.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById(`${type}Progress`).style.width = `${percentage}%`;
    document.getElementById(`${type}ProgressText`).textContent = `${percentage}%`;
}

// Render All Goals
function renderAllGoals() {
    renderGoals('daily');
    renderGoals('monthly');
    renderGoals('yearly');
}

// Render History
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const filter = document.getElementById('historyFilter').value;
    
    if (!window.goalsData.history || window.goalsData.history.length === 0) {
        historyList.innerHTML = '<li class="empty-state">No history yet. Complete goals to see them here! 🎯</li>';
        return;
    }

    // Filter history based on selected filter
    const now = new Date();
    let filteredHistory = window.goalsData.history.slice().reverse(); // Most recent first

    if (filter === 'today') {
        const today = new Date().toDateString();
        filteredHistory = filteredHistory.filter(entry => new Date(entry.date).toDateString() === today);
    } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHistory = filteredHistory.filter(entry => new Date(entry.date) >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredHistory = filteredHistory.filter(entry => new Date(entry.date) >= monthAgo);
    }

    if (filteredHistory.length === 0) {
        historyList.innerHTML = '<li class="empty-state">No goals found for this time period.</li>';
        return;
    }

    // Group history by date
    const groupedByDate = {};
    filteredHistory.forEach(entry => {
        const date = new Date(entry.date).toDateString();
        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }
        groupedByDate[date].push(entry);
    });

    // Render grouped history
    let historyHtml = '';
    Object.keys(groupedByDate).forEach(date => {
        const entries = groupedByDate[date];
        const completedCount = entries.filter(e => e.completed).length;
        const totalCount = entries.length;

        historyHtml += `
            <li class="history-day">
                <div class="history-day-header">
                    <span class="history-day-date">${formatHistoryDate(date)}</span>
                    <span class="history-day-stats">${completedCount}/${totalCount} completed</span>
                </div>
                <ul class="history-goals">
                    ${entries.map(entry => `
                        <li class="history-goal-item ${entry.completed ? '' : 'incomplete'}">
                            <div class="history-checkmark">${entry.completed ? '✓' : '—'}</div>
                            <span class="history-goal-text">${escapeHtml(entry.text)}</span>
                            <span class="history-goal-time">${formatHistoryTime(entry.date)}</span>
                        </li>
                    `).join('')}
                </ul>
            </li>
        `;
    });

    historyList.innerHTML = historyHtml;
}

// Format history date
function formatHistoryDate(dateString) {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    if (dateString === today) {
        return '📅 Today';
    } else if (dateString === yesterday) {
        return '📅 Yesterday';
    } else {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return '📅 ' + date.toLocaleDateString('en-US', options);
    }
}

// Format history time
function formatHistoryTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
