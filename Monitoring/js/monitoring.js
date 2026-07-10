/**
 * Monitoring Page — Mock Data Version
 * Handles search, timeline rendering, schedule/consultation/feedback cards
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof MOCK_DATA === 'undefined') return;

    const searchInput = document.getElementById('reportIdInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchLoader = document.getElementById('searchLoader');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const timelineContainer = document.getElementById('timelineContainer');
    const timelineHeader = document.getElementById('timelineHeader');
    const timeline = document.getElementById('timeline');

    // Search Events
    if (searchBtn) {
        searchBtn.addEventListener('click', doSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    }

    // Auto-load case based on URL or default to first case
    const urlParams = new URLSearchParams(window.location.search);
    const kodeParam = urlParams.get('kode');

    if (kodeParam) {
        if (searchInput) searchInput.value = kodeParam;
        doSearch();
    } else {
        // Automatically load the first mock case to fulfill the requirement "langsung tampil"
        if (MOCK_DATA.cases && MOCK_DATA.cases.length > 0) {
            if (searchInput) searchInput.value = MOCK_DATA.cases[0].kode_laporan;
            doSearch();
        }
    }

    function doSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        if (!query) {
            showError('Silakan masukkan kode laporan atau email.');
            return;
        }

        // Show loader
        hideError();
        if (searchLoader) searchLoader.style.display = 'flex';

        // Simulate loading
        setTimeout(() => {
            if (searchLoader) searchLoader.style.display = 'none';

            const caseData = MOCK_DATA.findCase(query);
            if (!caseData) {
                showError('Kode Laporan atau Email "' + query + '" tidak ditemukan dalam sistem.');
                return;
            }

            renderTimeline(caseData);
        }, 800);
    }

    function showError(msg) {
        if (errorMessage) errorMessage.style.display = 'flex';
        if (errorText) errorText.textContent = msg;
    }

    function hideError() {
        if (errorMessage) errorMessage.style.display = 'none';
    }

    function renderTimeline(c) {
        // Show header
        if (timelineHeader) {
            timelineHeader.style.display = '';
            document.getElementById('timelineTitle').textContent = 'Progress Laporan #' + c.id;
            document.getElementById('timelineId').textContent = c.kode_laporan;
            document.getElementById('timelineDate').textContent = new Date(c.tanggal_laporan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            const statusBadge = document.getElementById('statusBadge');
            const statusText = document.getElementById('statusText');
            if (statusBadge && statusText) {
                statusText.textContent = c.status;
                const statusClasses = { Completed: 'status-completed', Process: 'status-process', Investigation: 'status-investigation' };
                statusBadge.className = 'timeline-status-badge ' + (statusClasses[c.status] || '');
            }
        }

        // Timeline steps
        if (timeline) {
            timeline.innerHTML = c.timeline.map((step, i) => {
                const iconMap = {
                    completed: 'fas fa-check-circle',
                    active: 'fas fa-spinner fa-pulse',
                    pending: 'fas fa-circle'
                };
                const colorMap = {
                    completed: '#22c55e',
                    active: '#3b82f6',
                    pending: '#d1d5db'
                };

                return `
                <div class="timeline-item ${step.status}" style="display:flex;gap:20px;margin-bottom:30px;position:relative;">
                    <div class="timeline-icon" style="flex-shrink:0;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${colorMap[step.status]}22;position:relative;z-index:2;">
                        <i class="${iconMap[step.status]}" style="color:${colorMap[step.status]};font-size:1.1rem;"></i>
                    </div>
                    ${i < c.timeline.length - 1 ? `<div style="position:absolute;left:19px;top:40px;bottom:-30px;width:2px;background:${step.status === 'completed' ? '#22c55e' : '#e5e7eb'};z-index:1;"></div>` : ''}
                    <div style="flex:1;padding-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <h4 style="font-size:1rem;font-weight:600;color:${step.status === 'pending' ? '#9ca3af' : '#1e293b'};margin:0;">${step.title}</h4>
                            <span style="font-size:0.8rem;color:#94a3b8;">${step.date || '-'}</span>
                        </div>
                        <p style="font-size:0.9rem;color:${step.status === 'pending' ? '#d1d5db' : '#64748b'};margin:0;line-height:1.5;">${step.description}</p>
                    </div>
                </div>
                `;
            }).join('');
        }

        // Schedule Card
        const scheduleCard = document.getElementById('scheduleCard');
        const scheduleInfo = document.getElementById('scheduleInfo');
        if (scheduleCard && scheduleInfo && c.jadwal) {
            scheduleCard.style.display = '';
            const j = c.jadwal;
            const dt = new Date(j.tanggal + 'T' + j.waktu);
            scheduleInfo.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div><span style="font-size:0.8rem;color:#64748b;display:block;">Psikolog</span><strong>${c.psikolog_name}</strong></div>
                    <div><span style="font-size:0.8rem;color:#64748b;display:block;">Waktu</span><strong>${dt.toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})} ${j.waktu} WIB</strong></div>
                    <div><span style="font-size:0.8rem;color:#64748b;display:block;">Tipe</span><strong>${j.tipe}</strong></div>
                    <div><span style="font-size:0.8rem;color:#64748b;display:block;">Tempat/Link</span><strong>${j.lokasi}</strong></div>
                    <div><span style="font-size:0.8rem;color:#64748b;display:block;">Durasi</span><strong>${j.durasi} menit</strong></div>
                    <div><span style="font-size:0.8rem;color:#64748b;display:block;">Status</span><strong style="color:${j.status === 'Selesai' ? '#22c55e' : '#3b82f6'};">${j.status}</strong></div>
                </div>
            `;
        } else if (scheduleCard) {
            scheduleCard.style.display = 'none';
        }

        // Consultation Notes Card
        const consultationCard = document.getElementById('consultationCard');
        const consultationInfo = document.getElementById('consultationInfo');
        if (consultationCard && consultationInfo && c.catatan_psikolog) {
            consultationCard.style.display = '';
            const n = c.catatan_psikolog;
            const riskColors = { rendah: '#22c55e', sedang: '#f59e0b', tinggi: '#ef4444', kritis: '#dc2626' };
            consultationInfo.innerHTML = `
                <div style="margin-bottom:16px;">
                    <span style="font-size:0.8rem;color:#64748b;display:block;">Ringkasan</span>
                    <p style="margin:4px 0;color:#1e293b;font-weight:500;">${n.ringkasan}</p>
                </div>
                <div style="margin-bottom:16px;">
                    <span style="font-size:0.8rem;color:#64748b;display:block;">Detail Konsultasi</span>
                    <p style="margin:4px 0;color:#475569;line-height:1.6;">${n.detail}</p>
                </div>
                <div style="margin-bottom:16px;">
                    <span style="font-size:0.8rem;color:#64748b;display:block;">Rekomendasi</span>
                    <p style="margin:4px 0;color:#475569;">${n.rekomendasi}</p>
                </div>
                <div>
                    <span style="font-size:0.8rem;color:#64748b;display:block;">Tingkat Risiko</span>
                    <span style="display:inline-block;padding:4px 12px;border-radius:12px;font-size:0.85rem;font-weight:600;background:${riskColors[n.tingkat_risiko]}22;color:${riskColors[n.tingkat_risiko]};">${n.tingkat_risiko.charAt(0).toUpperCase() + n.tingkat_risiko.slice(1)}</span>
                </div>
            `;
        } else if (consultationCard) {
            consultationCard.style.display = 'none';
        }

        // Feedback / Confirmation Card
        const feedbackCard = document.getElementById('feedbackCard');
        if (feedbackCard) {
            if (c.catatan_psikolog && c.catatan_psikolog.status === 'Confirmed' && !c.feedback_user) {
                // Show form to confirm/dispute
                feedbackCard.style.display = '';
                document.getElementById('feedbackPrompt').textContent = 'Silakan tinjau catatan konsultasi di atas, kemudian konfirmasi atau ajukan keberatan.';
                document.getElementById('feedbackForm').style.display = '';
            } else if (c.feedback_user) {
                feedbackCard.style.display = '';
                const ff = c.feedback_user;
                document.getElementById('feedbackForm').style.display = 'none';
                document.getElementById('feedbackPrompt').innerHTML = `
                    <div style="padding:16px;border-radius:8px;border-left:4px solid ${ff.status === 'confirmed' ? '#22c55e' : '#ef4444'};background:${ff.status === 'confirmed' ? '#f0fdf4' : '#fef2f2'};">
                        <strong style="color:${ff.status === 'confirmed' ? '#22c55e' : '#ef4444'};">${ff.status === 'confirmed' ? '✅ Anda telah menyetujui hasil konsultasi' : '⚠️ Keberatan telah diajukan'}</strong>
                        <p style="margin:8px 0;color:#475569;">${ff.komentar}</p>
                        <small style="color:#94a3b8;">${ff.created_at}</small>
                    </div>
                `;
            } else {
                feedbackCard.style.display = 'none';
            }
        }

        // Interactive feedback buttons (demo)
        const btnConfirm = document.getElementById('btnConfirm');
        const btnEskalasiHukum = document.getElementById('btnEskalasiHukum');
        const btnDispute = document.getElementById('btnDispute');
        const btnSubmitDispute = document.getElementById('btnSubmitDispute');
        const btnCancelDispute = document.getElementById('btnCancelDispute');
        const disputeGroup = document.getElementById('disputeDetailGroup');

        // Legal Consent
        const legalConsentGroup = document.getElementById('legalConsentGroup');
        const checkLegalConsent = document.getElementById('checkLegalConsent');
        const btnSubmitLegal = document.getElementById('btnSubmitLegal');
        const btnCancelLegal = document.getElementById('btnCancelLegal');

        function hideMainButtons() {
            if(btnConfirm) btnConfirm.style.display = 'none';
            if(btnEskalasiHukum) btnEskalasiHukum.style.display = 'none';
            if(btnDispute) btnDispute.style.display = 'none';
        }

        function showMainButtons() {
            if(btnConfirm) btnConfirm.style.display = '';
            if(btnEskalasiHukum) btnEskalasiHukum.style.display = '';
            if(btnDispute) btnDispute.style.display = '';
        }

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                alert('Terima kasih! Laporan Anda telah dikonfirmasi sebagai selesai. (demo)');
                feedbackCard.style.display = 'none';
            });
        }
        
        if (btnEskalasiHukum) {
            btnEskalasiHukum.addEventListener('click', () => {
                hideMainButtons();
                if(legalConsentGroup) legalConsentGroup.style.display = 'block';
            });
        }
        
        if (checkLegalConsent && btnSubmitLegal) {
            checkLegalConsent.addEventListener('change', (e) => {
                if(e.target.checked) {
                    btnSubmitLegal.disabled = false;
                    btnSubmitLegal.style.opacity = '1';
                    btnSubmitLegal.style.cursor = 'pointer';
                } else {
                    btnSubmitLegal.disabled = true;
                    btnSubmitLegal.style.opacity = '0.5';
                    btnSubmitLegal.style.cursor = 'not-allowed';
                }
            });
            
            btnSubmitLegal.addEventListener('click', () => {
                const hash = MOCK_DATA.generateBlockchainHash();
                alert('Persetujuan Eskalasi Hukum Berhasil Dikirim (Demo).\n\nImmutable Hash: ' + hash);
                feedbackCard.style.display = 'none';
            });
        }

        if (btnCancelLegal) {
            btnCancelLegal.addEventListener('click', () => {
                if(legalConsentGroup) legalConsentGroup.style.display = 'none';
                if(checkLegalConsent) checkLegalConsent.checked = false;
                if(btnSubmitLegal) { btnSubmitLegal.disabled = true; btnSubmitLegal.style.opacity = '0.5'; btnSubmitLegal.style.cursor = 'not-allowed'; }
                showMainButtons();
            });
        }

        if (btnDispute) {
            btnDispute.addEventListener('click', () => {
                if (disputeGroup) disputeGroup.style.display = '';
                if (btnSubmitDispute) btnSubmitDispute.style.display = '';
                if (btnCancelDispute) btnCancelDispute.style.display = '';
                hideMainButtons();
            });
        }
        if (btnCancelDispute) {
            btnCancelDispute.addEventListener('click', () => {
                if (disputeGroup) disputeGroup.style.display = 'none';
                if (btnSubmitDispute) btnSubmitDispute.style.display = 'none';
                btnCancelDispute.style.display = 'none';
                showMainButtons();
            });
        }
        if (btnSubmitDispute) {
            btnSubmitDispute.addEventListener('click', () => {
                alert('Keberatan Anda telah dikirim ke tim Satgas PPKPT. (demo)');
                feedbackCard.style.display = 'none';
            });
        }

        // Audit Trail Card
        const auditTrailCard = document.getElementById('auditTrailCard');
        const auditTrailList = document.getElementById('auditTrailList');
        if (auditTrailCard && auditTrailList && c.audit_trail && c.audit_trail.length > 0) {
            auditTrailCard.style.display = '';
            renderAuditTrail(c.audit_trail, 'all');
        }

        // Scroll to timeline
        if (timelineContainer) {
            timelineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderAuditTrail(trail, filter) {
        const auditTrailList = document.getElementById('auditTrailList');
        if (!auditTrailList) return;
        const filtered = filter === 'all' ? trail : trail.filter(a => a.role === filter);
        const roleColors = { system: '#64748b', admin: '#3b82f6', psikolog: '#0C969C', user: '#f59e0b', hukum: '#5a8bc4' };
        const roleIcons = { system: 'fas fa-cog', admin: 'fas fa-user-shield', psikolog: 'fas fa-user-md', user: 'fas fa-user', hukum: 'fas fa-gavel' };

        auditTrailList.innerHTML = filtered.map(a => `
            <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9;" data-role="${a.role}">
                <div style="width:36px;height:36px;border-radius:50%;background:${roleColors[a.role] || '#111827'}15;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="${roleIcons[a.role] || 'fas fa-info-circle'}" style="color:${roleColors[a.role] || '#111827'};font-size:0.85rem;"></i>
                </div>
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong style="font-size:0.9rem;color:#1e293b;">${a.actor}</strong>
                        <span style="font-size:0.75rem;color:#94a3b8;">${a.timestamp}</span>
                    </div>
                    <p style="margin:4px 0 0;font-size:0.85rem;color:#475569;">${a.action}</p>
                    <small style="color:#94a3b8;">${a.detail}</small>
                </div>
            </div>
        `).join('');
    }

    // Global filter function for audit trail
    window.filterAudit = function (role) {
        const query = searchInput ? searchInput.value.trim() : '';
        const c = MOCK_DATA.findCase(query);
        if (c && c.audit_trail) {
            renderAuditTrail(c.audit_trail, role);
        }
        // Update active filter button
        document.querySelectorAll('.audit-filters .filter-btn').forEach(btn => {
            const btnText = btn.textContent.trim().toLowerCase();
            let isMatch = false;
            if(role === 'all' && btnText === 'semua') isMatch = true;
            else if (role === 'admin' && btnText === 'admin') isMatch = true;
            else if (role === 'psikolog' && btnText === 'psikolog') isMatch = true;
            else if (role === 'hukum' && btnText.includes('hukum')) isMatch = true;

            btn.classList.toggle('active', isMatch);
            if (btn.classList.contains('active')) {
                btn.style.background = '#132338';
                btn.style.color = 'white';
            } else {
                btn.style.background = 'white';
                btn.style.color = '#475569';
            }
        });
    };

    // Close audit modal
    window.closeAuditModal = function () {
        const modal = document.getElementById('auditDetailModal');
        if (modal) modal.style.display = 'none';
    };

    // Reveal animations
    const reveals = document.querySelectorAll('[data-reveal]');
    reveals.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
});