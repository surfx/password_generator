' Iniciar servidor via VBS
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -File ""D:\projetos\javascript\plugins\password_generator\server\start.ps1""", 0
