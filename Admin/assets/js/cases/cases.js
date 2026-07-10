/**
 * Admin Cases List — Mock Data Version
 */
document.addEventListener('DOMContentLoaded', function () {
    const activeList = document.getElementById('list-active');
    const completedList = document.getElementById('list-completed');
    const countActive = document.getElementById('count-active');
    const countCompleted = document.getElementById('count-completed');
    const rawStorage = document.getElementById('raw-data-storage');

    // Hide old raw data
    if (rawStorage) rawStorage.style.display = 'none';

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            if (tab === 'active') {
                activeList.style.display = '';
                completedList.style.display = 'none';
                document.getElementById('btnDeleteTrash')?.classList.add('d-none');
            } else {
                activeList.style.display = 'none';
                completedList.style.display = '';
            }
        });
    });

    // Render cases from MOCK_DATA
    if (typeof MOCK_DATA === 'undefined') return;

    let activeCount = 0, completedCount = 0;

    MOCK_DATA.cases.forEach(c => {
        const isCompleted = c.status === 'Completed';
        if (isCompleted) completedCount++;
        else activeCount++;

        const statusClass = c.status === 'Completed' ? 'status-completed'
            : c.status === 'Investigation' ? 'status-investigation'
            : 'status-process';

        const worryClass = c.tingkat_kekhawatiran;
        const dateFormatted = new Date(c.tanggal_laporan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

        const html = `
            <a href="case-detail.html?id=${c.id}" class="case-item-link" data-status="${isCompleted ? 'completed' : 'active'}">
                <div class="case-item">
                    <div class="case-content">
                        <div class="case-checkbox">
                            <input class="form-check-input" type="checkbox" onclick="event.stopPropagation()">
                        </div>
                        <div class="case-id">#${c.id}</div>
                        <div class="case-worry">
                            <div class="khawatir-bar ${worryClass}"></div>
                        </div>
                        <div class="case-email">
                            <i class="bi bi-envelope-fill"></i>
                            <span>${c.email}</span>
                        </div>
                        <div class="case-date">
                            <i class="bi bi-calendar-event-fill"></i>
                            <span>${dateFormatted}</span>
                        </div>
                        <div class="case-status">
                            <span class="status-badge ${statusClass}">${c.status}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;

        if (isCompleted) completedList.insertAdjacentHTML('beforeend', html);
        else activeList.insertAdjacentHTML('beforeend', html);
    });

    countActive.textContent = activeCount;
    countCompleted.textContent = completedCount;

    if (activeCount === 0) activeList.innerHTML = '<div class="empty-state"><p>Tidak ada kasus aktif</p></div>';
    if (completedCount === 0) completedList.innerHTML = '<div class="empty-state"><p>Tidak ada riwayat selesai</p></div>';

    // Check all
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', function () {
            const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
            const container = activeTab === 'completed' ? completedList : activeList;
            container.querySelectorAll('.form-check-input').forEach(cb => cb.checked = this.checked);
        });
    }

    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            window.location.href = '../../../index.html';
        });
    }
});
