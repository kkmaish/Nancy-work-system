@echo off
echo Starting Nancy Work System app...
start /min "" node "C:\Users\NANCY\Downloads\nancy work system\server.js"
timeout /t 3 /nobreak >nul
start "" http://localhost:8080/nancy.html
echo App opened in your browser. Leave this window open while using the system.
pause
