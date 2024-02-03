# inicia o 2 vscodes: 1 - projeto php, 2 - projeto extensão chrome
$path="D:\meus_documentos\workspace\css\password_generator"
$path1="$path\controle_password_gen"
$path2="$path\extensao_chrome"
$vscode="C:\Users\zero_\AppData\Local\Programs\Microsoft VS Code\Code.exe"

Start-Process $vscode -a $path1 -RedirectStandardOutput ".\NUL"
Start-Process $vscode -a $path2 -RedirectStandardOutput ".\NUL"
