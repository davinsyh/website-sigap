/**
 * Psikolog Dashboard — Mock Data Version
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof MOCK_DATA === 'undefined') return;

    const psikolog = MOCK_DATA.psikolog;
    const myCases = MOCK_DATA.getPsikologCases(psikolog.id);

    // Profile
    document.getElementById('profileName').textContent = psikolog.name;
    document.getElementById('profileSpecialization').textContent = psikolog.specialization;

    // Date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Stats
    const total = myCases.length;
    const aktif = myCases.filter(c => c.status !== 'Completed').length;
    const menunggu = myCases.filter(c => c.catatan_psikolog && c.catatan_psikolog.status === 'Menunggu_Konfirmasi').length;
    const dispute = myCases.filter(c => c.feedback_user && c.feedback_user.status === 'dispute').length;
    const selesai = myCases.filter(c => c.status === 'Completed').length;

    setText('statTotal', total);
    setText('statAktif', aktif);
    setText('statMenunggu', menunggu);
    setText('statDispute', dispute);
    setText('statSelesai', selesai);

    // Recent Cases Table
    renderCasesTable('recentCasesBody', myCases.slice(0, 5));

    // All Cases Table
    renderCasesTable('allCasesBody', myCases);

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            const val = statusFilter.value;
            const filtered = val ? myCases.filter(c => {
                if (val === 'Dijadwalkan') return c.jadwal && c.jadwal.status === 'Dijadwalkan';
                if (val === 'Konsultasi') return c.jadwal && c.jadwal.status === 'Selesai' && !c.catatan_psikolog;
                if (val === 'Menunggu_Konfirmasi') return c.catatan_psikolog && !c.feedback_user;
                if (val === 'Dispute') return c.feedback_user && c.feedback_user.status === 'dispute';
                if (val === 'Closed') return c.status === 'Completed';
                return true;
            }) : myCases;
            renderCasesTable('allCasesBody', filtered);
        });
    }

    // Schedule list
    const scheduleList = document.getElementById('scheduleList');
    if (scheduleList) {
        const scheduledCases = myCases.filter(c => c.jadwal);
        if (scheduledCases.length === 0) {
            scheduleList.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>Belum ada jadwal pertemuan</p></div>';
        } else {
            scheduleList.innerHTML = scheduledCases.map(c => {
                const j = c.jadwal;
                const dt = new Date(j.tanggal + 'T' + j.waktu);
                const statusClass = j.status === 'Selesai' ? 'stat-success' : 'stat-info';
                return `
                <div class="schedule-item" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; background: #fafafa;">
                    <div>
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">
                            <i class="fas fa-user" style="color: #6366f1; margin-right: 6px;"></i>
                            Kasus #${c.id}
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b;">
                            <i class="fas fa-calendar" style="margin-right: 4px;"></i>
                            ${dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} — ${j.waktu} WIB
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 2px;">
                            <i class="fas fa-${j.tipe.includes('Online') ? 'video' : 'building'}" style="margin-right: 4px;"></i>
                            ${j.tipe} — ${j.lokasi}
                        </div>
                    </div>
                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
                        background: ${j.status === 'Selesai' ? '#dcfce7' : '#e0f2fe'};
                        color: ${j.status === 'Selesai' ? '#16a34a' : '#0284c7'};">${j.status}</span>
                </div>
                `;
            }).join('');
        }
    }

    // Navigation
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
            const target = document.getElementById('page-' + page);
            if (target) target.classList.add('active');
            const titles = { overview: 'Overview', cases: 'Kasus Saya', schedule: 'Jadwal' };
            document.getElementById('pageTitle').textContent = titles[page] || 'Overview';
        });
    });

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    if (mobileToggle) mobileToggle.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    // Modal functionality
    const caseModal = document.getElementById('caseModal');
    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', () => { caseModal.style.display = 'none'; });
    if (caseModal) caseModal.addEventListener('click', (e) => { if (e.target === caseModal) caseModal.style.display = 'none'; });

    // Tab switching in modal
    document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active');
        });
    });

    // Notes form submit (demo)
    const notesForm = document.getElementById('notesForm');
    if (notesForm) {
        notesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Catatan berhasil di-submit ke user (demo)');
            caseModal.style.display = 'none';
        });
    }

    // Save Draft (demo)
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => { alert('Draft berhasil disimpan (demo)'); });
    }

    // Dispute response (demo)
    const sendDisputeResponse = document.getElementById('sendDisputeResponse');
    if (sendDisputeResponse) {
        sendDisputeResponse.addEventListener('click', () => {
            alert('Respon dispute berhasil dikirim (demo)');
            caseModal.style.display = 'none';
        });
    }

    // Character counter
    const ringkasan = document.getElementById('ringkasanKasus');
    const ringkasanCount = document.getElementById('ringkasanCount');
    if (ringkasan && ringkasanCount) {
        ringkasan.addEventListener('input', () => { ringkasanCount.textContent = ringkasan.value.length; });
    }

    // ============ Helper functions ============

    function renderCasesTable(tbodyId, cases) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        if (cases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada kasus</p></td></tr>';
            return;
        }
        tbody.innerHTML = cases.map(c => {
            const riskLabel = c.catatan_psikolog ? c.catatan_psikolog.tingkat_risiko : '-';
            const riskColors = { rendah: '#22c55e', sedang: '#f59e0b', tinggi: '#ef4444', kritis: '#dc2626' };
            const jadwalText = c.jadwal ? new Date(c.jadwal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + c.jadwal.waktu : '-';
            const statusLabels = { Completed: 'Selesai', Process: 'Baru', Investigation: 'Investigasi' };
            const statusColors = { Completed: '#22c55e', Process: '#3b82f6', Investigation: '#f59e0b' };
            return `
            <tr style="cursor:pointer;" onclick="openCaseModal('${c.id}')">
                <td><span style="font-weight:600;color:#1e293b;">${c.kode_laporan}</span></td>
                <td><span style="padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;background:${statusColors[c.status] || '#94a3b8'}22;color:${statusColors[c.status] || '#94a3b8'};">${statusLabels[c.status] || c.status}</span></td>
                <td><span style="color:${riskColors[riskLabel] || '#94a3b8'};font-weight:600;font-size:0.85rem;">${riskLabel !== '-' ? riskLabel.charAt(0).toUpperCase() + riskLabel.slice(1) : '-'}</span></td>
                <td style="font-size:0.85rem;color:#64748b;">${jadwalText}</td>
                <td><button class="btn-view" style="padding:5px 12px;background:#6366f1;color:white;border:none;border-radius:6px;font-size:0.8rem;cursor:pointer;" onclick="event.stopPropagation();openCaseModal('${c.id}')"><i class="fas fa-eye"></i> Detail</button></td>
            </tr>
            `;
        }).join('');
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    // Make openCaseModal global
    window.openCaseModal = function (caseId) {
        const c = MOCK_DATA.findCase(caseId);
        if (!c || !caseModal) return;
        caseModal.style.display = 'flex';

        document.getElementById('modalTitle').textContent = 'Detail Kasus #' + c.id;

        // Detail tab
        const detailGrid = document.getElementById('caseDetailGrid');
        if (detailGrid) {
            detailGrid.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div><label style="font-size:0.8rem;color:#94a3b8;display:block;">Kode Laporan</label><span style="font-weight:600;">${c.kode_laporan}</span></div>
                    <div><label style="font-size:0.8rem;color:#94a3b8;display:block;">Status</label><span style="font-weight:600;">${c.status}</span></div>
                    <div><label style="font-size:0.8rem;color:#94a3b8;display:block;">Email Korban</label><span>${c.email}</span></div>
                    <div><label style="font-size:0.8rem;color:#94a3b8;display:block;">WhatsApp</label><span>${c.whatsapp}</span></div>
                    <div><label style="font-size:0.8rem;color:#94a3b8;display:block;">Gender</label><span>${c.gender_korban}</span></div>
                    <div><label style="font-size:0.8rem;color:#94a3b8;display:block;">Usia</label><span>${c.usia_korban || '-'} tahun</span></div>
                    <div style="grid-column:1/-1;"><label style="font-size:0.8rem;color:#94a3b8;display:block;">Kronologi</label><p style="margin-top:4px;line-height:1.6;color:#475569;">${c.detail_kejadian}</p></div>
                    ${c.jadwal ? `
                    <div style="grid-column:1/-1;padding:12px;background:#e0f2fe;border-radius:8px;">
                        <label style="font-size:0.8rem;color:#0284c7;display:block;font-weight:600;">Jadwal Konsultasi</label>
                        <span>${new Date(c.jadwal.tanggal).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})} ${c.jadwal.waktu} WIB — ${c.jadwal.tipe}</span>
                    </div>` : ''}
                </div>
            `;
        }

        // Pre-fill notes if exists
        if (c.catatan_psikolog) {
            const r = document.getElementById('ringkasanKasus');
            const d = document.getElementById('detailKonsultasi');
            const rec = document.getElementById('rekomendasi');
            if (r) r.value = c.catatan_psikolog.ringkasan;
            if (d) d.value = c.catatan_psikolog.detail;
            if (rec) rec.value = c.catatan_psikolog.rekomendasi;
            const risk = document.querySelector(`input[name="tingkatRisiko"][value="${c.catatan_psikolog.tingkat_risiko}"]`);
            if (risk) risk.checked = true;
            if (ringkasanCount) ringkasanCount.textContent = c.catatan_psikolog.ringkasan.length;
        }

        // Feedback tab
        const feedbackList = document.getElementById('feedbackList');
        if (feedbackList) {
            if (c.feedback_user) {
                const isDispute = c.feedback_user.status === 'dispute';
                feedbackList.innerHTML = `
                    <div style="padding:16px;border-radius:8px;border-left:4px solid ${isDispute ? '#ef4444' : '#22c55e'};background:${isDispute ? '#fef2f2' : '#f0fdf4'};">
                        <strong style="color:${isDispute ? '#ef4444' : '#22c55e'};">${isDispute ? '⚠️ Dispute dari User' : '✅ User Setuju & Selesai'}</strong>
                        <p style="margin:8px 0;color:#475569;">${c.feedback_user.komentar}</p>
                        <small style="color:#94a3b8;">${c.feedback_user.created_at}</small>
                    </div>
                `;
                const disputeForm = document.getElementById('disputeResponseForm');
                if (disputeForm) disputeForm.style.display = isDispute ? 'block' : 'none';
            } else {
                feedbackList.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">Belum ada feedback dari user.</p>';
            }
        }

        // Reset to first tab
        document.querySelectorAll('.modal-tabs .tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
        document.querySelectorAll('.tab-content').forEach((t, i) => t.classList.toggle('active', i === 0));
    };
});
