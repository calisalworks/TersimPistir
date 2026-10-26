@echo off
chcp 65001 >nul
title Tersim Pistir - Google Play Versiyon Yoneticisi
cls

:MENU
echo ====================================================
echo    TERSIM PISTIR - GOOGLE PLAY VERSIYON YONETICISI
echo ====================================================
echo.

REM Mevcut versiyonu goster
where node >nul 2>nul
if %errorlevel% equ 0 (
    node scripts/bump-version.js show
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$v = Get-Content 'version.json' | ConvertFrom-Json; Write-Host ('Mevcut Versiyon Adi  : ' + $v.versionName); Write-Host ('Mevcut Versiyon Kodu : ' + $v.versionCode + ' (Google Play versionCode)')"
)

echo ----------------------------------------------------
echo Lutfen yapmak istediginiz islemi secin:
echo.
echo  [1] Patch Surumu Artir   (Orn: 1.0.1 -^> 1.0.2  ^| Kod: +1)
echo  [2] Minor Surumu Artir   (Orn: 1.0.1 -^> 1.1.0  ^| Kod: +1)
echo  [3] Major Surumu Artir   (Orn: 1.0.1 -^> 2.0.0  ^| Kod: +1)
echo  [4] Sadece Google Play versionCode Artir (+1)
echo  [5] Manuel Ozel Versiyon Gir (Orn: 1.2.5)
echo  [0] Cikis
echo ====================================================
set /p SECIM="Seciminiz (0-5): "

if "%SECIM%"=="1" goto BUMP_PATCH
if "%SECIM%"=="2" goto BUMP_MINOR
if "%SECIM%"=="3" goto BUMP_MAJOR
if "%SECIM%"=="4" goto BUMP_CODE
if "%SECIM%"=="5" goto BUMP_CUSTOM
if "%SECIM%"=="0" goto CIKIS

echo.
echo Gecersiz secim! Lutfen 0 ile 5 arasinda bir sayi girin.
pause
cls
goto MENU

:BUMP_PATCH
cls
where node >nul 2>nul
if %errorlevel% equ 0 (
    node scripts/bump-version.js patch
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$v=Get-Content 'version.json'|ConvertFrom-Json;$p=$v.versionName.Split('.');$p[2]=[int]$p[2]+1;$v.versionName=($p -join '.');$v.versionCode=[int]$v.versionCode+1;$v|ConvertTo-Json|Set-Content 'version.json';Write-Host 'Patch guncellendi: ' $v.versionName ' (Kod: ' $v.versionCode ')'"
)
goto BITTI

:BUMP_MINOR
cls
where node >nul 2>nul
if %errorlevel% equ 0 (
    node scripts/bump-version.js minor
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$v=Get-Content 'version.json'|ConvertFrom-Json;$p=$v.versionName.Split('.');$p[1]=[int]$p[1]+1;$p[2]=0;$v.versionName=($p -join '.');$v.versionCode=[int]$v.versionCode+1;$v|ConvertTo-Json|Set-Content 'version.json';Write-Host 'Minor guncellendi: ' $v.versionName ' (Kod: ' $v.versionCode ')'"
)
goto BITTI

:BUMP_MAJOR
cls
where node >nul 2>nul
if %errorlevel% equ 0 (
    node scripts/bump-version.js major
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$v=Get-Content 'version.json'|ConvertFrom-Json;$p=$v.versionName.Split('.');$p[0]=[int]$p[0]+1;$p[1]=0;$p[2]=0;$v.versionName=($p -join '.');$v.versionCode=[int]$v.versionCode+1;$v|ConvertTo-Json|Set-Content 'version.json';Write-Host 'Major guncellendi: ' $v.versionName ' (Kod: ' $v.versionCode ')'"
)
goto BITTI

:BUMP_CODE
cls
where node >nul 2>nul
if %errorlevel% equ 0 (
    node scripts/bump-version.js code
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$v=Get-Content 'version.json'|ConvertFrom-Json;$v.versionCode=[int]$v.versionCode+1;$v|ConvertTo-Json|Set-Content 'version.json';Write-Host 'Sadece versionCode artirildi: ' $v.versionCode"
)
goto BITTI

:BUMP_CUSTOM
cls
echo ====================================================
echo           OZEL VERSIYON BELIRLEME
echo ====================================================
set /p YENI_VER="Yeni Versiyon Adi (Orn: 1.0.2): "
set /p YENI_KOD="Google Play Versiyon Kodu [Bos birakirsaniz otomatik artar]: "
where node >nul 2>nul
if %errorlevel% equ 0 (
    node scripts/bump-version.js custom %YENI_VER% %YENI_KOD%
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$v=Get-Content 'version.json'|ConvertFrom-Json;$v.versionName='%YENI_VER%';if('%YENI_KOD%' -ne ''){$v.versionCode=[int]'%YENI_KOD%'}else{$v.versionCode=[int]$v.versionCode+1};$v|ConvertTo-Json|Set-Content 'version.json';Write-Host 'Ozel versiyon ayarlandi: ' $v.versionName ' (Kod: ' $v.versionCode ')'"
)
goto BITTI

:BITTI
echo.
echo Islem tamamlandi! Tekrar islem yapmak icin bir tusa basin...
pause >nul
cls
goto MENU

:CIKIS
echo.
echo Tersim Pistir versiyon yoneticisinden cikildi.
exit /b 0
