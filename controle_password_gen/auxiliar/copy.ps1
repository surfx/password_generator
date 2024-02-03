# copia os arquivos do projeto php para wsl2 ubuntu
$pasta_origem="D:\meus_documentos\workspace\css\password_generator\controle_password_gen\"
$pasta_destino="\\wsl.localhost\Ubuntu-22.04\var\www\html\helloworld\"

if (-not (Test-Path -Path $pasta_destino)) {
	mkdir -p $pasta_destino
}

if (-not (Test-Path -Path $pasta_destino)) {
	Write-Host "Erro ao acessar a pasta '$pasta_destino'"
	return
}

Remove-Item $pasta_destino"*" -Recurse
Copy-Item -Path $pasta_origem"*" -Destination $pasta_destino -Recurse
Remove-Item $pasta_destino"auxiliar" -Recurse

Write-Host "Arquivos copiados: $pasta_destino"
