param(
    [string]$ExtensionID
)

$ErrorActionPreference = "Stop"

# Auto-Elevação para Administrador (se necessário para HKLM, mas HKCU não precisa. 
# O exemplo do usuário usava admin, talvez por precaução, mas HKCU é por usuário. Vou manter simples).

if (-not $ExtensionID) {
    Write-Host "Por favor, informe o ID da extensão."
    Write-Host "Você pode encontrá-lo em chrome://extensions/"
    $ExtensionID = Read-Host "ID da Extensão"
}

if (-not $ExtensionID) {
    Write-Error "ID da extensão é obrigatório."
    exit 1
}

$currentDir = $PSScriptRoot
$batPath = Join-Path $currentDir "run_host.bat"
# Escape backslashes for JSON
$batPathEscaped = $batPath.Replace("\", "\\")

$manifestPath = Join-Path $currentDir "manifest_host.json"
$registryPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.emerson.password_generator"

$manifestContent = @"
{
  "name": "com.emerson.password_generator",
  "description": "Host nativo para Password Generator",
  "path": "$batPathEscaped",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$ExtensionID/"
  ]
}
"@

$manifestContent | Out-File -FilePath $manifestPath -Encoding utf8
Write-Host "Manifesto criado em: $manifestPath" -ForegroundColor Cyan

# Registry
if (-not (Test-Path $registryPath)) {
    New-Item -Path $registryPath -Force | Out-Null
}
Set-ItemProperty -Path $registryPath -Name "(Default)" -Value $manifestPath
Write-Host "Registro criado em: $registryPath" -ForegroundColor Green
Write-Host "Configuração concluída!"
