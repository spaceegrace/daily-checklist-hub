var myChart = null; // Put this at the very top of your script

function renderChart() {
    var canvas = document.getElementById('pondChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    // 1. Combine and sort all data by time for the X-axis
    var allData = [
        ...pondData.sugarLog.map(s => ({ x: s.id, y: s.val, type: 'Sugar' })),
        ...pondData.carbLog.map(c => ({ x: c.id, y: c.val, type: 'Carb' })),
        ...pondData.moodLog.map(m => ({ x: m.id, y: moodValues[m.val] || 0, type: 'Mood' }))
    ].sort((a, b) => a.x - b.x);

    // Create unique time labels
    var labels = allData.map(d => {
        var date = new Date(d.x);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " " + 
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    if (myChart) { myChart.destroy(); }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Glucose',
                    data: pondData.sugarLog.map(s => ({ x: labels[allData.findIndex(d => d.x === s.id)], y: s.val })),
                    borderColor: '#67a36a',
                    backgroundColor: 'rgba(103, 163, 106, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Carbs',
                    data: pondData.carbLog.map(c => ({ x: labels[allData.findIndex(d => d.x === c.id)], y: c.val })),
                    borderColor: '#7dd3fc',
                    backgroundColor: 'rgba(125, 211, 252, 0.1)',
                    tension: 0.3,
                    hidden: true // Keep hidden by default so it's not messy
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { display: false }, grid: { display: false } },
                y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } }
            },
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Add this at the very bottom of your renderAll() function
renderChart();
