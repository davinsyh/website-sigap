/**
 * SIAPI PPKPT — Legal Support Dashboard Logic
 * Architecture: Modular, Event-Driven, State-Managed
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof MOCK_DATA === 'undefined') {
        console.error('FATAL: MOCK_DATA not loaded. Ensure data.js is included before legal.js');
        return;
    }

    /* =============================================
       STATE & CONFIG
       ============================================= */
    const LEGAL_ID = 1;
    let currentLegalCases = [];
    let currentOpenedCase = null;
    let isRedactedMode = false;

    try {
        currentLegalCases = MOCK_DATA.getLegalCases(LEGAL_ID) || [];
    } catch (e) {
        console.warn('getLegalCases not available, falling back to filtered reports');
        currentLegalCases = (MOCK_DATA.reports || []).filter(r =>
            r.legal_consent && r.legal_consent.status === 'approved'
        );
    }

    /* =============================================
       DOM REFERENCES
       ============================================= */
    const DOM = {
        profileName: document.getElementById('profileName'),
        profileSpec: document.getElementById('profileSpecialization'),
        currentDate: document.getElementById('currentDate'),
        pageTitle: document.getElementById('pageTitle'),
        btnLogout: document.getElementById('logoutBtn'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        mobileToggle: document.getElementById('mobileToggle'),
        sidebar: document.getElementById('sidebar'),
        
        // Stats
        statTotal: document.getElementById('statTotal'),
        statAktif: document.getElementById('statAktif'),
        statSelesai: document.getElementById('statSelesai'),

        // Tables
        recentCasesBody: document.getElementById('recentCasesBody'),
        allCasesBody: document.getElementById('allCasesBody'),

        // Modal
        caseModal: document.getElementById('caseModal'),
        modalClose: document.getElementById('modalClose'),
        modalCode: document.getElementById('modalCode'),
        consentText: document.getElementById('consentText'),
        consentHash: document.getElementById('consentHash'),
        caseDetailGrid: document.getElementById('caseDetailGrid'),
        psikologNotesContainer: document.getElementById('psikologNotesContainer'),
        auditTrailList: document.getElementById('auditTrailList'),
        legalAnalysisForm: document.getElementById('legalAnalysisForm'),
        savedAnalysisContainer: document.getElementById('savedAnalysisContainer'),

        // Navigation
        navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page-content'),
    };

    /* =============================================
       INITIALIZATION
       ============================================= */
    function init() {
        setProfile();
        setDate();
        updateStats();
        renderRecentCases();
        renderAllCases();
        bindEvents();
    }

    function setProfile() {
        if (DOM.profileName && MOCK_DATA.legalSupport) {
            DOM.profileName.textContent = MOCK_DATA.legalSupport.name;
        }
        if (DOM.profileSpec && MOCK_DATA.legalSupport) {
            DOM.profileSpec.textContent = MOCK_DATA.legalSupport.specialization || 'Pendamping Hukum';
        }
    }

    function setDate() {
        if (!DOM.currentDate) return;
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        DOM.currentDate.textContent = new Date().toLocaleDateString('id-ID', opts);
    }

    /* =============================================
       STATS
       ============================================= */
    function updateStats() {
        const total = currentLegalCases.length;
        const active = currentLegalCases.filter(c => c.status !== 'Closed' && c.status !== 'Completed').length;
        const completed = total - active;

        if (DOM.statTotal) DOM.statTotal.textContent = total;
        if (DOM.statAktif) DOM.statAktif.textContent = active;
        if (DOM.statSelesai) DOM.statSelesai.textContent = completed;
    }

    /* =============================================
       TABLE RENDERING
       ============================================= */
    function renderRecentCases() {
        if (!DOM.recentCasesBody) return;
        if (currentLegalCases.length === 0) {
            DOM.recentCasesBody.innerHTML = `
                <tr><td colspan="5" class="empty-state">
                    <i class="fas fa-gavel"></i>
                    <p>Belum ada kasus yang dieskalasi ke pendamping hukum</p>
                </td></tr>`;
            return;
        }

        const recent = currentLegalCases.slice(-5);
        DOM.recentCasesBody.innerHTML = recent.map(c => {
            const hasConsent = c.legal_consent && c.legal_consent.status === 'approved';
            const risk = c.catatan_psikolog ? c.catatan_psikolog.tingkat_risiko : 'N/A';
            const legalStatus = c.catatan_hukum ? c.catatan_hukum.status : 'Dalam Pendampingan';

            return `
                <tr>
                    <td><strong>${c.kode_laporan}</strong></td>
                    <td>
                        ${hasConsent
                            ? '<span class="consent-badge verified"><i class="fas fa-shield-alt"></i> Terverifikasi</span>'
                            : '<span class="consent-badge locked"><i class="fas fa-lock"></i> Terkunci</span>'}
                    </td>
                    <td><span class="risk-tag risk-${(risk || '').toLowerCase()}">${risk}</span></td>
                    <td><span class="legal-status-tag">${legalStatus}</span></td>
                    <td>
                        <button class="btn-action btn-view" data-case-id="${c.id}" ${!hasConsent ? 'disabled' : ''}>
                            <i class="fas fa-external-link-alt"></i> Buka Berkas
                        </button>
                    </td>
                </tr>`;
        }).join('');
    }

    function renderAllCases() {
        if (!DOM.allCasesBody) return;

        if (currentLegalCases.length === 0) {
            DOM.allCasesBody.innerHTML = `
                <tr><td colspan="4" class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>Belum ada kasus pendampingan</p>
                </td></tr>`;
            return;
        }

        DOM.allCasesBody.innerHTML = currentLegalCases.map(c => {
            const hasConsent = c.legal_consent && c.legal_consent.status === 'approved';
            const hash = hasConsent ? c.legal_consent.blockchain_hash : '—';

            return `
                <tr>
                    <td><strong>${c.kode_laporan}</strong></td>
                    <td>
                        ${hasConsent
                            ? '<span class="consent-badge verified"><i class="fas fa-check-circle"></i> Ya</span>'
                            : '<span class="consent-badge locked"><i class="fas fa-times-circle"></i> Tidak</span>'}
                    </td>
                    <td><code class="hash-code">${hash}</code></td>
                    <td>
                        <button class="btn-action btn-view" data-case-id="${c.id}" ${!hasConsent ? 'disabled' : ''}>
                            <i class="fas fa-file-alt"></i> Lihat Full
                        </button>
                    </td>
                </tr>`;
        }).join('');
    }

    /* =============================================
       MODAL — CASE DETAIL
       ============================================= */
    function openCaseDetail(caseId) {
        const caseData = currentLegalCases.find(c => String(c.id) === String(caseId));
        if (!caseData || !caseData.legal_consent) return;

        // Populate modal header
        currentOpenedCase = caseData;
        if (DOM.modalCode) DOM.modalCode.textContent = caseData.kode_laporan;
        if (DOM.consentText) DOM.consentText.textContent = caseData.legal_consent.consent_text;
        if (DOM.consentHash) DOM.consentHash.textContent = caseData.legal_consent.blockchain_hash;

        // Render all tabs
        renderReportDetails(caseData);
        renderPsikologNotes(caseData);
        renderAuditTrail(caseData);
        renderLegalAnalysis(caseData);

        // Reset tabs to first
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const firstBtn = document.querySelector('.tab-btn[data-tab="detail"]');
        const firstTab = document.getElementById('tab-detail');
        if (firstBtn) firstBtn.classList.add('active');
        if (firstTab) firstTab.classList.add('active');

        // Show modal
        if (DOM.caseModal) DOM.caseModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (DOM.caseModal) DOM.caseModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Expose globally for legacy inline handlers (backward compat)
    window.openCaseDetail = openCaseDetail;

    /* =============================================
       RENDER FUNCTIONS
       ============================================= */
    function applyRedaction(text, isIdentifier = false) {
        if (!isRedactedMode || !text || text === '-') return text || '-';
        if (isIdentifier) {
            return `<span class="redact-highlight" title="Sensor Privasi Aktif (Klik matikan toggle)">***REDACTED***</span>`;
        }
        return `<span class="redact-highlight" title="Sensor Privasi Aktif">██████████████████</span>`;
    }

    function renderReportDetails(c) {
        if (!DOM.caseDetailGrid) return;
        
        // Cek fallback properti jika deskripsi_kejadian null tapi detail_kejadian ada
        const deskripsi = c.deskripsi_kejadian || c.detail_kejadian || 'Tidak ada deskripsi.';
        
        DOM.caseDetailGrid.innerHTML = `
            <div class="info-group">
                <span class="info-label"><i class="far fa-calendar-alt"></i> Tanggal Laporan</span>
                <span class="info-value">${c.tanggal_laporan || '-'}</span>
            </div>
            <div class="info-group">
                <span class="info-label"><i class="fas fa-venus-mars"></i> Profil Penyintas</span>
                <span class="info-value">Usia ${c.usia_korban || '-'} / ${c.gender_korban || '-'}</span>
            </div>
            <div class="info-group">
                <span class="info-label"><i class="fas fa-phone-alt"></i> Kontak Darurat</span>
                <span class="info-value">${applyRedaction(c.whatsapp || c.email || '-', true)}</span>
            </div>
            <div class="info-group">
                <span class="info-label"><i class="fas fa-user-shield"></i> Terlapor / Pelaku</span>
                <span class="info-value">${applyRedaction(c.pelaku_kekerasan || '-', false)}</span>
            </div>
            <div class="info-group">
                <span class="info-label"><i class="fas fa-align-left"></i> Kronologi Kejadian (Read-Only)</span>
                <div class="readonly-box">${isRedactedMode ? applyRedaction("Masked Description", false) : deskripsi}</div>
            </div>
            <div class="info-group">
                <span class="info-label"><i class="fas fa-map-marker-alt"></i> Lokasi Kejadian</span>
                <span class="info-value">${applyRedaction(c.lokasi_kejadian || '-', false)}</span>
            </div>`;
    }

    function renderPsikologNotes(c) {
        if (!DOM.psikologNotesContainer) return;
        if (c.catatan_psikolog) {
            DOM.psikologNotesContainer.innerHTML = `
                <div class="readonly-box" style="margin-bottom: 16px;">
                    <div style="margin-bottom: 16px;">
                        <span class="info-label"><i class="fas fa-clipboard-list"></i> Ringkasan Psikologis</span>
                        <p style="margin:6px 0 0; font-weight:500; font-size:0.92rem; color:var(--legal-text);">${c.catatan_psikolog.ringkasan}</p>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <span class="info-label"><i class="fas fa-exclamation-triangle"></i> Tingkat Risiko</span>
                        <span class="risk-tag risk-${(c.catatan_psikolog.tingkat_risiko || '').toLowerCase()}" style="display:inline-block; margin-top:6px;">
                            ${c.catatan_psikolog.tingkat_risiko || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span class="info-label"><i class="fas fa-heartbeat"></i> Rekomendasi Psikolog</span>
                        <p style="margin:6px 0 0; color:var(--legal-text-secondary); font-size:0.9rem; line-height:1.6;">${c.catatan_psikolog.rekomendasi}</p>
                    </div>
                </div>`;
        } else {
            DOM.psikologNotesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-md"></i>
                    <p>Belum ada catatan psikolog untuk kasus ini.</p>
                </div>`;
        }
    }

    function renderAuditTrail(c) {
        if (!DOM.auditTrailList) return;
        if (c.audit_trail && c.audit_trail.length > 0) {
            DOM.auditTrailList.innerHTML = c.audit_trail.map(t => `
                <div class="ledger-item">
                    <div class="ledger-action">
                        <strong>${t.action}</strong>
                        <small>Aktor: ${t.actor} (${t.role})${t.detail ? ' — ' + t.detail : ''}</small>
                    </div>
                    <div class="ledger-meta">
                        <span class="time">${t.timestamp}</span>
                        <span class="hash-text">${t.blockchain_hash || 'Pending Hash'}</span>
                    </div>
                </div>`).join('');
        } else {
            DOM.auditTrailList.innerHTML = `
                <div class="empty-state" style="padding:32px;">
                    <i class="fas fa-link"></i>
                    <p>Belum ada record audit trail.</p>
                </div>`;
        }
    }

    function renderLegalAnalysis(c) {
        if (!DOM.legalAnalysisForm || !DOM.savedAnalysisContainer) return;

        if (c.catatan_hukum) {
            DOM.legalAnalysisForm.style.display = 'none';
            DOM.savedAnalysisContainer.style.display = 'block';
            DOM.savedAnalysisContainer.innerHTML = `
                <h4><i class="fas fa-check-circle" style="color:var(--legal-success);"></i> Analisis Tersimpan</h4>
                <p><strong>Analisis:</strong> ${c.catatan_hukum.analisis}</p>
                <p><strong>Rekomendasi:</strong> ${c.catatan_hukum.rekomendasi_hukum}</p>`;
        } else {
            DOM.legalAnalysisForm.style.display = 'block';
            DOM.savedAnalysisContainer.style.display = 'none';

            // Clone form to remove old listeners
            const newForm = DOM.legalAnalysisForm.cloneNode(true);
            DOM.legalAnalysisForm.parentNode.replaceChild(newForm, DOM.legalAnalysisForm);
            DOM.legalAnalysisForm = newForm;

            newForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const analysisText = newForm.querySelector('#legalAnalysis').value;
                const recoText = newForm.querySelector('#legalRecommendation').value;
                const hash = typeof MOCK_DATA.generateBlockchainHash === 'function'
                    ? MOCK_DATA.generateBlockchainHash()
                    : '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);

                newForm.style.display = 'none';
                DOM.savedAnalysisContainer.style.display = 'block';
                DOM.savedAnalysisContainer.innerHTML = `
                    <h4><i class="fas fa-check-circle" style="color:var(--legal-success);"></i> Analisis Berhasil Disimpan</h4>
                    <p><strong>Analisis:</strong> ${analysisText}</p>
                    <p><strong>Rekomendasi:</strong> ${recoText}</p>
                    <p style="margin-top:12px;"><span class="info-label"><i class="fas fa-fingerprint"></i> Hash Transaksi</span>
                    <code class="hash-text">${hash}</code></p>`;
            });
        }
    }

    /* =============================================
       EVENT BINDING
       ============================================= */
    function bindEvents() {
        // Sidebar toggle
        if (DOM.sidebarToggle && DOM.sidebar) {
            DOM.sidebarToggle.addEventListener('click', () => {
                DOM.sidebar.classList.toggle('collapsed');
            });
        }

        // Mobile sidebar toggle
        if (DOM.mobileToggle && DOM.sidebar) {
            DOM.mobileToggle.addEventListener('click', () => {
                DOM.sidebar.classList.toggle('mobile-open');
            });
        }

        // Close sidebar on overlay click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && DOM.sidebar && DOM.sidebar.classList.contains('mobile-open')) {
                if (!DOM.sidebar.contains(e.target) && !DOM.mobileToggle.contains(e.target)) {
                    DOM.sidebar.classList.remove('mobile-open');
                }
            }
        });

        // Page navigation
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget.getAttribute('data-page');

                DOM.navLinks.forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');

                DOM.pages.forEach(p => p.classList.remove('active'));
                const page = document.getElementById('page-' + target);
                if (page) page.classList.add('active');

                if (DOM.pageTitle) {
                    DOM.pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
                }

                // Close mobile sidebar after navigation
                if (window.innerWidth <= 768 && DOM.sidebar) {
                    DOM.sidebar.classList.remove('mobile-open');
                }
            });
        });

        // Delegated event: Case detail buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-view[data-case-id]');
            if (btn && !btn.disabled) {
                openCaseDetail(btn.getAttribute('data-case-id'));
            }
        });

        // Modal close
        if (DOM.modalClose) {
            DOM.modalClose.addEventListener('click', closeModal);
        }

        // Close modal on overlay click
        if (DOM.caseModal) {
            DOM.caseModal.addEventListener('click', (e) => {
                if (e.target === DOM.caseModal) closeModal();
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.caseModal && DOM.caseModal.style.display === 'flex') {
                closeModal();
            }
        });

        // Modal tab switching
        document.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (!tabBtn) return;

            const targetTab = tabBtn.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            const tabEl = document.getElementById('tab-' + targetTab);
            if (tabEl) tabEl.classList.add('active');
        });

        // Logout
        if (DOM.btnLogout) {
            DOM.btnLogout.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }

        // Feature 5: Redact Mode Toggle
        const redactToggle = document.getElementById('redactToggle');
        if (redactToggle) {
            redactToggle.addEventListener('change', (e) => {
                isRedactedMode = e.target.checked;
                if (currentOpenedCase) renderReportDetails(currentOpenedCase);
            });
        }

        // Feature 1: Print Document Generator
        const btnBAP = document.getElementById('btnCetakBAP');
        const btnSomasi = document.getElementById('btnCetakSomasi');
        const printArea = document.getElementById('printArea');

        if (btnBAP && printArea) {
            btnBAP.addEventListener('click', (e) => {
                e.preventDefault();
                if (!currentOpenedCase) return;
                
                printArea.innerHTML = `
                    <div class="doc-pdf">
                        <div class="doc-header">
                            <h2>SATGAS PENCEGAHAN DAN PENANGANAN KEKERASAN SEKSUAL</h2>
                            <h3>(S A T G A S  P P K S)</h3>
                            <p>Institut Pendidikan & Keamanan</p>
                        </div>
                        <h1 class="doc-title" style="text-align:center;">BERITA ACARA PEMERIKSAAN (BAP) INTERNAL</h1>
                        <p>Pada hari ini, tanggal <strong>${new Date().toLocaleDateString('id-ID')}</strong>, bertempat di Ruang Satgas PPKS, telah dilakukan telaah perkara laporan dugaan pelanggaran kekerasan seksual dengan rincian sebagai berikut:</p>
                        
                        <table class="doc-table">
                            <tr><td style="width: 30%;">Kode Registrasi</td><td>: <strong>${currentOpenedCase.kode_laporan}</strong></td></tr>
                            <tr><td>Tanggal Laporan</td><td>: ${currentOpenedCase.tanggal_laporan || '-'}</td></tr>
                            <tr><td>Profil Pelapor</td><td>: Usia ${currentOpenedCase.usia_korban || '-'} / ${currentOpenedCase.gender_korban || '-'}</td></tr>
                            <tr><td>Terlapor/Pelaku</td><td>: ${isRedactedMode ? applyRedaction("", false) : (currentOpenedCase.pelaku_kekerasan || '-')}</td></tr>
                        </table>

                        <h4>KRONOLOGI SINGKAT:</h4>
                        <p style="text-align: justify;">${isRedactedMode ? applyRedaction("", false) : (currentOpenedCase.detail_kejadian || 'Tidak ada deskripsi rinci.')}</p>

                        <h4>HASIL ANALISIS HUKUM:</h4>
                        <p style="text-align: justify;">${currentOpenedCase.catatan_hukum ? currentOpenedCase.catatan_hukum.analisis : 'Belum dianalisis oleh tim hukum.'}</p>

                        <p style="margin-top:20px;">Demikian Berita Acara Pemeriksaan (BAP) Internal ini dibuat dengan sebenar-benarnya untuk digunakan sebagaimana mestinya dalam proses penegakan disiplin dan hukum lanjutan.</p>
                        
                        <div class="tanda-tangan">
                            <div>
                                <p>Pendamping Hukum / Pemeriksa</p>
                                <div class="signature-space"></div>
                                <p><strong>( ${currentOpenedCase.legal_support_name || '______________'} )</strong></p>
                            </div>
                            <div>
                                <p>Ketua Satgas PPKPT</p>
                                <div class="signature-space"></div>
                                <p><strong>( ______________________ )</strong></p>
                            </div>
                        </div>
                    </div>
                `;
                window.print();
            });
        }

        if (btnSomasi && printArea) {
            btnSomasi.addEventListener('click', (e) => {
                e.preventDefault();
                if (!currentOpenedCase) return;

                printArea.innerHTML = `
                    <div class="doc-pdf">
                        <p><strong>Bandung, ${new Date().toLocaleDateString('id-ID')}</strong></p>
                        <table style="margin-bottom:20px;">
                            <tr><td style="width:100px;">Nomor</td><td>: Skh.01/${currentOpenedCase.kode_laporan}/PPKPT/${new Date().getFullYear()}</td></tr>
                            <tr><td>Lampiran</td><td>: 1 (satu) Berkas</td></tr>
                            <tr><td>Perihal</td><td>: <strong>SOMASI I (PERTAMA) / TEGURAN KERAS</strong></td></tr>
                        </table>

                        <p>Kepada Yth.,<br>
                        <strong>Sdr/i. Terlapor (${isRedactedMode ? applyRedaction("", false) : (currentOpenedCase.pelaku_kekerasan || '-')})</strong><br>
                        Di Tempat</p>

                        <p style="margin-top:20px;">Dengan hormat,</p>
                        <p style="text-align: justify;">
                        Bertindak untuk dan atas nama Satgas PPKPT selaku kuasa pelapor dengan Kode Registrasi Hak <strong>${currentOpenedCase.kode_laporan}</strong>, dengan ini kami menyampaikan <strong>SOMASI (Teguran Hukum)</strong> kepada Saudara dengan alasan sebagai berikut:
                        </p>

                        <ol style="text-align: justify;">
                            <li>Bahwa berdasarkan laporan tanggal ${currentOpenedCase.tanggal_laporan || '-'}, Saudara diduga kuat telah melakukan pelanggaran Kode Etik PPKPT bertempat di ${isRedactedMode ? applyRedaction("", false) : (currentOpenedCase.lokasi_kejadian || '-')}.</li>
                            <li>Bahwa tindakan Saudara berpotensi melanggar ketentuan pidana dalam UU Nomor 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (TPKS).</li>
                            <li>Bahwa segala bentuk intimidasi lebih lanjut terhadap korban atau saksi akan berakibat pada pelaporan kepada pihak Kepolisian Republik Indonesia.</li>
                        </ol>

                        <p style="text-align: justify;">
                        Kami **MEMINTA DENGAN TEGAS** agar Saudara segera menghadiri panggilan pemeriksaan mediasi selambat-lambatnya 3 (tiga) hari kerja sejak surat ini diterima. 
                        </p>

                        <p>Apabila Saudara mengabaikan Somasi ini, kami akan meneruskan perkara ini melalui jalur hukum yang berlaku.</p>
                        
                        <p style="margin-top:40px;">Hormat kami,</p>
                        <p><strong>Pendamping Hukum Satgas PPKPT</strong></p>
                        <div class="signature-space"></div>
                        <p><strong>( ${currentOpenedCase.legal_support_name || 'Tim Advokasi Hukum'} )</strong></p>
                    </div>
                `;
                window.print();
            });
        }
    }

    /* =============================================
       EXECUTE
       ============================================= */
    init();
});
