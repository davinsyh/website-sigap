<?php
/**
 * SIGAP PPKS - Konfigurasi Utama
 * 
 * File ini memuat semua konfigurasi dasar aplikasi.
 * Dimuat oleh semua API endpoint sebagai entry point konfigurasi.
 * 
 * @package SIGAP_PPKS
 */

// Load environment variables
if (!function_exists('env')) {
    require_once __DIR__ . '/env_loader.php';
}

// ============================================
// APLIKASI
// ============================================
if (!defined('APP_ENV')) {
    define('APP_ENV', env('APP_ENV', 'development'));
}

if (!defined('DEBUG_MODE')) {
    define('DEBUG_MODE', env('DEBUG_MODE', false));
}

if (!defined('APP_TIMEZONE')) {
    define('APP_TIMEZONE', env('APP_TIMEZONE', 'Asia/Jakarta'));
}

// Set timezone
date_default_timezone_set(APP_TIMEZONE);

// ============================================
// ERROR REPORTING
// ============================================
if (APP_ENV === 'production') {
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
} else {
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    error_reporting(E_ALL);
}

// ============================================
// KEAMANAN
// ============================================
if (!defined('ENCRYPTION_KEY')) {
    define('ENCRYPTION_KEY', env('ENCRYPTION_KEY', ''));
}

if (!defined('SESSION_LIFETIME')) {
    define('SESSION_LIFETIME', env('SESSION_LIFETIME', 1800));
}

if (!defined('MAX_LOGIN_ATTEMPTS')) {
    define('MAX_LOGIN_ATTEMPTS', env('MAX_LOGIN_ATTEMPTS', 5));
}

if (!defined('LOCKOUT_DURATION')) {
    define('LOCKOUT_DURATION', env('LOCKOUT_DURATION', 30));
}

// ============================================
// MAINTENANCE
// ============================================
if (!defined('MAINTENANCE_SECRET_KEY')) {
    define('MAINTENANCE_SECRET_KEY', env('MAINTENANCE_SECRET_KEY', ''));
}

// ============================================
// UPLOAD
// ============================================
if (!defined('MAX_UPLOAD_SIZE')) {
    define('MAX_UPLOAD_SIZE', env('MAX_UPLOAD_SIZE', 10485760));
}

if (!defined('ALLOWED_EXTENSIONS')) {
    define('ALLOWED_EXTENSIONS', env('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,webp,mp4,mov,webm'));
}

if (!defined('MAX_FILES_PER_UPLOAD')) {
    define('MAX_FILES_PER_UPLOAD', env('MAX_FILES_PER_UPLOAD', 5));
}

// ============================================
// PATHS
// ============================================
if (!defined('BASE_PATH')) {
    define('BASE_PATH', dirname(__DIR__));
}

if (!defined('CONFIG_PATH')) {
    define('CONFIG_PATH', __DIR__);
}

if (!defined('UPLOAD_PATH')) {
    define('UPLOAD_PATH', BASE_PATH . '/uploads');
}

if (!defined('LOG_PATH')) {
    define('LOG_PATH', BASE_PATH . '/api/logs');
}

// Pastikan direktori log tersedia
if (!is_dir(LOG_PATH)) {
    @mkdir(LOG_PATH, 0755, true);
}
