Set sh = CreateObject("WScript.Shell")
appDir = "C:\Users\NANCY\Downloads\nancy work system"
sh.Run "node """ & appDir & "\server.js""", 0, False
WScript.Sleep 2000
edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
sh.Run """" & edge & """ --app=http://localhost:8080 --user-data-dir=""" & appDir & "\app-profile"" --app-name=""Nancy Work System""", 1, False
