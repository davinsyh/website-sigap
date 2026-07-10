/**
 * SIAPI PPKPT - Sidebar & Auth Global Logic (Final Version)
 * File: Admin/assets/js/sidebar.js
 */

document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // 1. LOGIKA TAMPILAN SIDEBAR (DARI KODE LAMA ANDA)
    // ============================================
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');

    if (sidebar && toggleButton) {
        toggleButton.addEventListener('click', function (event) {
            event.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }

    // Tutup sidebar jika klik di luar (untuk mobile)
    if (mainContent) {
        mainContent.addEventListener('click', function () {
            if (window.innerWidth <= 991 && sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Reset sidebar saat layar dibesarkan
    window.addEventListener('resize', function () {
        if (window.innerWidth > 991 && sidebar) {
            sidebar.classList.remove('active');
        }
    });

    // ============================================
    // 1B. USER PROFILE DROPDOWN TOGGLE
    // ============================================
    const userProfileToggle = document.getElementById('userProfileToggle');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (userProfileToggle && userDropdownMenu) {
        userProfileToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (event) {
            if (!userProfileToggle.contains(event.target) && !userDropdownMenu.contains(event.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    // ============================================
    // 2. LOGIKA KEAMANAN (BARU)
    // ============================================

    // LOGIC TOMBOL LOGOUT (MOCK DATA VERSION)
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
    }
});

// Fungsi Logout - Mock Version
function handleLogout() {
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
    if (!confirmLogout) return;

    const btnLogout = document.getElementById('btnLogout');
    const originalText = btnLogout ? btnLogout.innerHTML : '';

    if (btnLogout) {
        btnLogout.disabled = true;
        btnLogout.innerHTML = '<i class="bi bi-hourglass-split me-2"></i><span>Keluar...</span>';
    }

    setTimeout(() => {
        window.location.href = '../../../index.html';
    }, 500);
}