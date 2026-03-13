$originalPath = Get-Location
& "$PSScriptRoot\kill.ps1"
cd D:\projetos\javascript\plugins\password_generator\server\native_host
python native_host.py
Set-Location $originalPath
