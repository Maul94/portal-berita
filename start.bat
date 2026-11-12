@echo off
title Portal Berita Nasional - Launcher
echo ===================================================
echo   PORTAL BERITA NASIONAL & CMS ADMIN
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa database MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL/MariaDB sudah aktif.
) else (
    echo [..] Menjalankan MySQL dari XAMPP...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start /B "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 3 /nobreak >nul
        echo [OK] MySQL berhasil dijalankan.
    ) else (
        echo [!] C:\xampp\mysql\bin\mysqld.exe tidak ditemukan.
        echo     Pastikan MySQL Anda sudah aktif secara manual.
    )
)

echo.
echo [2/3] Membuka browser...
start http://localhost:3000
start http://localhost:3000/admin

echo.
echo [3/3] Menjalankan server Node.js Express...
echo.
echo Server berjalan di:
echo - Portal Berita: http://localhost:3000
echo - Admin CMS:     http://localhost:3000/admin
echo   Email:         admin@portalberita.id
echo   Password:      admin123
echo.
echo Tekan CTRL+C untuk menghentikan server.
echo ===================================================
echo.

node server.js
pause
