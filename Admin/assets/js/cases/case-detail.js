/**
 * Admin Case Detail — Mock Data Version
 */
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('id');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const caseContent = document.getElementById('caseContent');

    if (!caseId || typeof MOCK_DATA === 'undefined') {
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        return;
    }

    const caseData = MOCK_DATA.findCase(caseId);
    if (!caseData) {
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        document.getElementById('errorMessage').textContent = `Kasus dengan ID "${caseId}" tidak ditemukan.`;
        return;
    }

    // Show content
    loadingState.style.display = 'none';
    caseContent.style.display = '';

    // Breadcrumb
    const bc = document.getElementById('breadcrumbCode');
    if (bc) bc.textContent = '#' + caseData.id;

    // Status Header
    document.getElementById('caseCode').textContent = '#' + caseData.id;
    document.getElementById('caseDate').textContent = 'Dilaporkan: ' + new Date(caseData.tanggal_laporan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const statusBadge = document.getElementById('statusBadge');
    statusBadge.querySelector('span').textContent = caseData.status;
    statusBadge.className = 'status-badge-large ' + caseData.status.toLowerCase().replace(/\s+/g, '-');

    // Emergency Status
    const statusDarurat = document.getElementById('statusDarurat');
    if (statusDarurat) {
        if (caseData.status_darurat) {
            statusDarurat.innerHTML = '<span class="urgency-indicator darurat"><i class="bi bi-exclamation-triangle-fill"></i> DARURAT</span>';
        } else {
            statusDarurat.innerHTML = '<span class="urgency-indicator tidak-darurat"><i class="bi bi-check-circle-fill"></i> Tidak Darurat</span>';
        }
    }

    // Worry Level
    const tk = document.getElementById('tingkatKekhawatiran');
    if (tk) {
        const worryLabels = { sedikit: 'Sedikit Khawatir', khawatir: 'Khawatir', sangat: 'Sangat Khawatir' };
        tk.innerHTML = `<span class="worry-badge ${caseData.tingkat_kekhawatiran}">${worryLabels[caseData.tingkat_kekhawatiran] || caseData.tingkat_kekhawatiran}</span>`;
    }

    // Victim Info
    setText('korbanSebagai', caseData.korban_sebagai);
    setText('genderKorban', caseData.gender_korban);
    setText('usiaKorban', caseData.usia_korban ? caseData.usia_korban + ' tahun' : '-');
    setText('statusDisabilitas', caseData.status_disabilitas);
    if (caseData.status_disabilitas === 'Ya') {
        const wrapper = document.getElementById('jenisDisabilitasWrapper');
        if (wrapper) { wrapper.style.display = ''; setText('jenisDisabilitas', caseData.jenis_disabilitas); }
    }

    // Contact
    setText('emailKorban', caseData.email);
    setText('whatsappKorban', caseData.whatsapp);

    // Incident Detail
    setText('pelakuKekerasan', caseData.pelaku_kekerasan);
    setText('waktuKejadian', new Date(caseData.waktu_kejadian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setText('lokasiKejadian', caseData.lokasi_kejadian);
    setText('detailKejadian', caseData.detail_kejadian);

    // Hide encrypted notice (no encryption in demo)
    const encNotice = document.getElementById('encryptedNotice');
    if (encNotice) encNotice.style.display = 'none';

    // Evidence
    const evidenceList = document.getElementById('evidenceList');
    const noEvidence = document.getElementById('noEvidence');
    if (caseData.bukti && caseData.bukti.length > 0) {
        evidenceList.innerHTML = caseData.bukti.map(b => `
            <div class="evidence-item">
                <i class="bi bi-file-earmark-image"></i>
                <span>${b}</span>
            </div>
        `).join('');
        if (noEvidence) noEvidence.style.display = 'none';
    } else {
        evidenceList.innerHTML = '';
        if (noEvidence) noEvidence.style.display = '';
    }

    // Schedule Info
    if (caseData.jadwal) {
        const schedSection = document.getElementById('scheduleInfoSection');
        if (schedSection) {
            schedSection.style.display = '';
            setText('schedulePsikolog', caseData.psikolog_name);
            const dt = new Date(caseData.jadwal.tanggal + 'T' + caseData.jadwal.waktu);
            setText('scheduleTimeAuth', dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + caseData.jadwal.waktu + ' WIB (' + caseData.jadwal.durasi + ' menit)');
            setText('scheduleType', caseData.jadwal.tipe);
            setText('scheduleLocation', caseData.jadwal.lokasi);
        }
    }

    // Consultation & Feedback Status
    if (caseData.catatan_psikolog) {
        const csSection = document.getElementById('consultationStatusSection');
        if (csSection) {
            csSection.style.display = '';
            const csBadge = document.getElementById('consultationStatusBadge');
            if (csBadge) csBadge.innerHTML = `<span class="badge bg-success">${caseData.catatan_psikolog.status}</span>`;
            const riskBadge = document.getElementById('consultationRiskBadge');
            if (riskBadge) {
                const riskColors = { rendah: 'success', sedang: 'warning', tinggi: 'danger', kritis: 'danger' };
                riskBadge.innerHTML = `<span class="badge bg-${riskColors[caseData.catatan_psikolog.tingkat_risiko] || 'secondary'}">${caseData.catatan_psikolog.tingkat_risiko.charAt(0).toUpperCase() + caseData.catatan_psikolog.tingkat_risiko.slice(1)}</span>`;
            }
        }
        // Feedback history
        if (caseData.feedback_user) {
            const fbList = document.getElementById('feedbackHistoryList');
            if (fbList) {
                // Adjusting labels and indicators to match workflow: (A) Selesai, (B) Lanjut ke Hukum
                const isConfirmed = caseData.feedback_user.status === 'confirmed';
                const fbStatusLabel = isConfirmed ? '✅ Selesai (Proses Berhenti)' : '⚖️ Lanjut ke Hukum / Banding';
                const borderColor = isConfirmed ? '#22c55e' : '#d97706';
                const bgColor = isConfirmed ? '#f0fdf4' : '#fffbeb';
                
                fbList.innerHTML = `
                    <div style="padding: 12px; border-left: 3px solid ${borderColor}; background: ${bgColor}; border-radius: 6px;">
                        <strong>${fbStatusLabel}</strong>
                        <p style="margin: 4px 0 0; color: #666;">${caseData.feedback_user.komentar}</p>
                        <small style="color: #999;">${caseData.feedback_user.created_at}</small>
                    </div>
                `;
            }
        }
    }

    // Schedule modal (interactive demo)
    const btnSchedule = document.getElementById('btnSchedule');
    const scheduleModal = document.getElementById('scheduleModal');
    const btnCloseSchedule = document.getElementById('btnCloseSchedule');
    if (btnSchedule && scheduleModal) {
        btnSchedule.addEventListener('click', () => { scheduleModal.style.display = 'flex'; });
        if (btnCloseSchedule) btnCloseSchedule.addEventListener('click', () => { scheduleModal.style.display = 'none'; });

        // Populate psikolog dropdown
        const psikologSelect = document.getElementById('psikologSelect');
        if (psikologSelect) {
            psikologSelect.innerHTML = '<option value="" selected disabled>Pilih Psikolog</option>' +
                MOCK_DATA.psikologList.map(p => `<option value="${p.id}">${p.name} — ${p.specialization}</option>`).join('');
        }

        // Schedule form submit (demo)
        const scheduleForm = document.getElementById('scheduleForm');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                scheduleModal.style.display = 'none';
                showToast('Jadwal berhasil disimpan (demo)', 'success');
            });
        }
    }

    // Status change (demo)
    document.querySelectorAll('#statusMenu .dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const newStatus = item.dataset.status;
            statusBadge.querySelector('span').textContent = newStatus;
            statusBadge.className = 'status-badge-large ' + newStatus.toLowerCase().replace(/\s+/g, '-');
            
            if (newStatus === 'Eskalasi Hukum') {
                const hash = MOCK_DATA.generateBlockchainHash();
                alert(`Kasus #${caseData.id} diteruskan ke Pendamping Hukum.\nHak akses telah dibatasi dengan sifat Read-Only.\n\nHash Transaksi Audit: ${hash}`);
            }
            
            showToast(`Status diubah ke "${newStatus}" (demo)`, 'success');
        });
    });

    // Status dropdown toggle
    const dropdownStatus = document.getElementById('dropdownStatus');
    const statusMenu = document.getElementById('statusMenu');
    if (dropdownStatus && statusMenu) {
        dropdownStatus.addEventListener('click', () => {
            statusMenu.style.display = statusMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (!dropdownStatus.contains(e.target) && !statusMenu.contains(e.target)) {
                statusMenu.style.display = 'none';
            }
        });
    }

    // Delete (demo)
    const btnDelete = document.getElementById('btnDelete');
    const deleteModal = document.getElementById('deleteModal');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    if (btnDelete && deleteModal) {
        const modalCode = document.getElementById('modalCaseCode');
        if (modalCode) modalCode.textContent = '#' + caseData.id;
        btnDelete.addEventListener('click', () => { deleteModal.style.display = 'flex'; });
        if (btnCancelDelete) btnCancelDelete.addEventListener('click', () => { deleteModal.style.display = 'none'; });
        if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            showToast('Kasus dihapus (demo)', 'success');
            setTimeout(() => { window.location.href = 'cases.html'; }, 1000);
        });
    }

    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', () => { window.location.href = '../../../index.html'; });

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '-';
    }

    function showToast(msg, type) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast-item toast-' + type;
        toast.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}`;
        toast.style.cssText = 'padding:12px 20px;background:#132338;color:white;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;gap:8px;animation:fadeInUp 0.3s ease;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        container.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3000);
    }
});
