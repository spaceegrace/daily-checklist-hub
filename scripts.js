// Daily Goals Hub - JavaScript

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();
    loadGoals();
    setupEventListeners();
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
            yearly: []
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
        saveGoals();
        renderGoals(type);
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
        window.goalsData[type] = window.goalsData[type].filter(g => !g.completed);
    } else if (mode === 'all') {
        if (!confirm('Clear ALL goals? This cannot be undone!')) return;
        window.goalsData[type] = [];
    }
    saveGoals();
    renderGoals(type);
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

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
