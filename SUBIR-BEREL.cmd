@echo off
echo Iniciando subida FTP de Berel... > "E:\BEREL\SITIO WEB BEREL\upload-log.txt"
powershell -ExecutionPolicy Bypass -NoProfile -File "E:\BEREL\SITIO WEB BEREL\subir-berel-ftp.ps1" >> "E:\BEREL\SITIO WEB BEREL\upload-log.txt" 2>&1
echo EXITCODE=%ERRORLEVEL% >> "E:\BEREL\SITIO WEB BEREL\upload-log.txt"
echo FIN >> "E:\BEREL\SITIO WEB BEREL\upload-log.txt"
