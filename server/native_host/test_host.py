import subprocess
import struct
import json
import sys

def send_native_message(message):
    """Envia mensagem para o host nativo e recebe resposta"""
    
    # Codifica mensagem
    encoded_content = json.dumps(message).encode('utf-8')
    encoded_length = struct.pack('@I', len(encoded_content))
    
    # Inicia processo
    proc = subprocess.Popen(
        ['run_host.bat'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Envia mensagem
    proc.stdin.write(encoded_length)
    proc.stdin.write(encoded_content)
    proc.stdin.flush()
    
    # Lê resposta
    response_length_bytes = proc.stdout.read(4)
    if len(response_length_bytes) == 4:
        response_length = struct.unpack('@I', response_length_bytes)[0]
        response = proc.stdout.read(response_length).decode('utf-8')
        return json.loads(response)
    
    return None

# Teste 1: Login
print("Teste 1: Login com usuário inexistente")
response = send_native_message({
    "action": "login",
    "payload": {"login": "test@test.com", "senha": "123"}
})
print(f"Resposta: {response}\n")

# Teste 2: Criar usuário
print("Teste 2: Criar usuário")
response = send_native_message({
    "action": "insert_user",
    "payload": {"nome": "Teste", "login": "test@test.com", "senha": "123"}
})
print(f"Resposta: {response}\n")

# Teste 3: Login novamente
print("Teste 3: Login com usuário criado")
response = send_native_message({
    "action": "login",
    "payload": {"login": "test@test.com", "senha": "123"}
})
print(f"Resposta: {response}")