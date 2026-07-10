/**
 * Admin Statistics — Mock Data Version
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof MOCK_DATA === 'undefined') return;

    const stats = MOCK_DATA.getStatistics();

    // Summary Cards
    setText('totalReports', stats.total);
    setText('summaryProcess', stats.process);
    setText('summaryInProgress', stats.investigation);
    setText('summaryCompleted', stats.completed);

    // Gender Chart
    const genderCtx = document.getElementById('genderChart');
    if (genderCtx) {
        new Chart(genderCtx, {
            type: 'doughnut',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    data: [stats.gender['Laki-laki'], stats.gender['Perempuan']],
                    backgroundColor: ['#3b82f6', '#ec4899'],
                    borderWidth: 0, borderRadius: 4
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, cutout: '70%' }
        });
        setText('stat-male-count', stats.gender['Laki-laki']);
        setText('stat-female-count', stats.gender['Perempuan']);
        setText('stat-male-percent', Math.round(stats.gender['Laki-laki'] / stats.total * 100) + '%');
        setText('stat-female-percent', Math.round(stats.gender['Perempuan'] / stats.total * 100) + '%');
    }

    // Worry Level Chart
    const worryCtx = document.getElementById('worryLevelChart');
    if (worryCtx) {
        new Chart(worryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Sedikit Khawatir', 'Khawatir', 'Sangat Khawatir'],
                datasets: [{
                    data: [stats.worry.sedikit, stats.worry.khawatir, stats.worry.sangat],
                    backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
                    borderWidth: 0, borderRadius: 4
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, cutout: '70%' }
        });
        setText('stat-sedikit-count', stats.worry.sedikit);
        setText('stat-khawatir-count', stats.worry.khawatir);
        setText('stat-sangat-count', stats.worry.sangat);
        setText('stat-sedikit-percent', Math.round(stats.worry.sedikit / stats.total * 100) + '%');
        setText('stat-khawatir-percent', Math.round(stats.worry.khawatir / stats.total * 100) + '%');
        setText('stat-sangat-percent', Math.round(stats.worry.sangat / stats.total * 100) + '%');
    }

    // Status Chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'bar',
            data: {
                labels: ['Process', 'In Progress', 'Completed'],
                datasets: [{
                    label: 'Jumlah Kasus',
                    data: [stats.process, stats.investigation, stats.completed],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e'],
                    borderRadius: 8, barThickness: 40
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
        setText('stat-process-count', stats.process);
        setText('stat-inprogress-count', stats.investigation);
        setText('stat-completed-count', stats.completed);
        setText('stat-process-percent', Math.round(stats.process / stats.total * 100) + '%');
        setText('stat-inprogress-percent', Math.round(stats.investigation / stats.total * 100) + '%');
        setText('stat-completed-percent', Math.round(stats.completed / stats.total * 100) + '%');
    }

    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', () => { window.location.href = '../../../index.html'; });

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
});
