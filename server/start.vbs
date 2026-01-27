' Salve em: win+r shell:startup
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -File ""D:\projetos\javascript\password_generator\server\start.ps1""", 0