#!/usr/bin/env python3
"""
Script de Setup - MongoDB Authentication Project
================================================
Este script auxilia na configuração inicial e verificação do ambiente.
"""

import sys
import subprocess
import os
from pathlib import Path

def print_header(text):
    """Imprime um cabeçalho formatado."""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def check_command(command):
    """Verifica se um comando está disponível."""
    try:
        subprocess.run(
            [command, "--version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def main():
    """Função principal do setup."""
    print_header("MongoDB Authentication Project - Setup")
    
    # Verificar pré-requisitos
    print("\n📋 Verificando pré-requisitos...")
    
    # Python
    python_version = sys.version_info
    if python_version.major >= 3 and python_version.minor >= 8:
        print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} - OK")
    else:
        print(f"❌ Python {python_version.major}.{python_version.minor} - Requer Python 3.8+")
        sys.exit(1)
    
    # Docker
    if check_command("docker"):
        result = subprocess.run(
            ["docker", "--version"],
            capture_output=True,
            text=True
        )
        print(f"✅ Docker - OK ({result.stdout.strip()})")
    else:
        print("❌ Docker não encontrado - Por favor, instale o Docker")
        sys.exit(1)
    
    # Docker Compose
    if check_command("docker-compose"):
        result = subprocess.run(
            ["docker-compose", "--version"],
            capture_output=True,
            text=True
        )
        print(f"✅ Docker Compose - OK ({result.stdout.strip()})")
    else:
        print("❌ Docker Compose não encontrado - Por favor, instale o Docker Compose")
        sys.exit(1)
    
    # Verificar estrutura de diretórios
    print("\n📁 Verificando estrutura de diretórios...")
    
    required_dirs = [
        "init-db"
    ]
    
    for dir_name in required_dirs:
        if os.path.isdir(dir_name):
            print(f"✅ Diretório '{dir_name}' - OK")
        else:
            print(f"❌ Diretório '{dir_name}' não encontrado")
    
    # Verificar arquivos obrigatórios
    print("\n📄 Verificando arquivos obrigatórios...")
    
    required_files = [
        "docker-compose.yml",
        "mongo_client.py",
        "requirements.txt",
        "README.md",
        "init-db/01-create-roles.js",
        "init-db/02-create-users.js",
        "init-db/03-create-collections.js"
    ]
    
    for file_name in required_files:
        if os.path.isfile(file_name):
            print(f"✅ Arquivo '{file_name}' - OK")
        else:
            print(f"❌ Arquivo '{file_name}' não encontrado")
    
    # Perguntar se deseja instalar dependências Python
    print("\n🐍 Dependências Python")
    response = input("Deseja instalar as dependências Python agora? (s/n): ").strip().lower()
    
    if response in ['s', 'sim', 'y', 'yes']:
        print("\n📦 Instalando dependências Python...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
                check=True
            )
            print("✅ Dependências instaladas com sucesso!")
        except subprocess.CalledProcessError:
            print("❌ Erro ao instalar dependências")
            print("💡 Tente executar manualmente: pip install -r requirements.txt")
    
    # Perguntar se deseja iniciar o Docker
    print("\n🐳 Docker Compose")
    response = input("Deseja iniciar os containers Docker agora? (s/n): ").strip().lower()
    
    if response in ['s', 'sim', 'y', 'yes']:
        print("\n🚀 Iniciando containers Docker...")
        try:
            subprocess.run(
                ["docker-compose", "up", "-d"],
                check=True
            )
            print("✅ Containers iniciados com sucesso!")
            print("\n⏳ Aguarde cerca de 10-15 segundos para a inicialização completa...")
            print("\n💡 Para ver os logs: docker-compose logs -f mongo")
        except subprocess.CalledProcessError:
            print("❌ Erro ao iniciar containers")
            print("💡 Tente executar manualmente: docker-compose up -d")
    
    # Informações finais
    print_header("Setup Concluído!")
    
    print("\n📚 Próximos passos:")
    print("   1. Aguarde os containers iniciarem (10-15 segundos)")
    print("   2. Verifique os logs: docker-compose logs -f mongo")
    print("   3. Execute a interface gráfica: python mongo_client.py")
    print("   4. Ou acesse Mongo Express: http://localhost:8081")
    print("      - Usuário: admin")
    print("      - Senha: admin")
    
    print("\n👥 Usuários disponíveis:")
    print("   • admin / admin (Root)")
    print("   • appAdmin / adminPass123 (Admin)")
    print("   • viewer / viewPass123 (Somente leitura)")
    print("   • dataEntry / entryPass123 (Escrita)")
    print("   • analyst / analystPass123 (Análise)")
    print("   • restrictedUser / restrictPass123 (Restrito)")
    print("   • developer / devPass123 (Dev)")
    
    print("\n📖 Documentação:")
    print("   • README.md - Documentação completa")
    print("   • TESTES.md - Guia de testes detalhado")
    print("   • ESPECIFICACAO.md - Especificação do projeto")
    
    print("\n🔧 Comandos úteis:")
    print("   • docker-compose ps          - Ver status dos containers")
    print("   • docker-compose logs -f     - Ver logs em tempo real")
    print("   • docker-compose down        - Parar containers")
    print("   • docker-compose down -v     - Resetar completamente")
    print("   • python mongo_client.py     - Iniciar interface gráfica")
    
    print("\n" + "=" * 70)
    print("  Pronto para usar! 🎉")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrompido pelo usuário.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)
