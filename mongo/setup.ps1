# ========================================
# Setup Script - MongoDB Authentication Project
# PowerShell Version
# ========================================

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  MongoDB Authentication Project - Setup" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar comando
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Verificar pré-requisitos
Write-Host "📋 Verificando pré-requisitos..." -ForegroundColor Yellow
Write-Host ""

# Python
if (Test-Command python) {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python - OK ($pythonVersion)" -ForegroundColor Green
}
else {
    Write-Host "❌ Python não encontrado - Por favor, instale Python 3.8+" -ForegroundColor Red
    exit 1
}

# Docker
if (Test-Command docker) {
    $dockerVersion = docker --version
    Write-Host "✅ Docker - OK ($dockerVersion)" -ForegroundColor Green
}
else {
    Write-Host "❌ Docker não encontrado - Por favor, instale Docker Desktop" -ForegroundColor Red
    exit 1
}

# Docker Compose
if (Test-Command docker-compose) {
    $dockerComposeVersion = docker-compose --version
    Write-Host "✅ Docker Compose - OK ($dockerComposeVersion)" -ForegroundColor Green
}
else {
    Write-Host "❌ Docker Compose não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar estrutura de diretórios
Write-Host ""
Write-Host "📁 Verificando estrutura de diretórios..." -ForegroundColor Yellow
Write-Host ""

$requiredDirs = @("init-db")

foreach ($dir in $requiredDirs) {
    if (Test-Path -Path $dir -PathType Container) {
        Write-Host "✅ Diretório '$dir' - OK" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Diretório '$dir' não encontrado" -ForegroundColor Red
    }
}

# Verificar arquivos obrigatórios
Write-Host ""
Write-Host "📄 Verificando arquivos obrigatórios..." -ForegroundColor Yellow
Write-Host ""

$requiredFiles = @(
    "docker-compose.yml",
    "mongo_client.py",
    "requirements.txt",
    "README.md",
    "init-db\01-create-roles.js",
    "init-db\02-create-users.js",
    "init-db\03-create-collections.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path -Path $file -PathType Leaf) {
        Write-Host "✅ Arquivo '$file' - OK" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Arquivo '$file' não encontrado" -ForegroundColor Red
    }
}

# Perguntar sobre instalação de dependências Python
Write-Host ""
Write-Host "🐍 Dependências Python" -ForegroundColor Yellow
$response = Read-Host "Deseja instalar as dependências Python agora? (s/n)"

if ($response -match "^[sS]") {
    Write-Host ""
    Write-Host "📦 Instalando dependências Python..." -ForegroundColor Yellow
    try {
        python -m pip install -r requirements.txt
        Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
        Write-Host "💡 Tente executar manualmente: pip install -r requirements.txt" -ForegroundColor Cyan
    }
}

# Perguntar sobre inicialização do Docker
Write-Host ""
Write-Host "🐳 Docker Compose" -ForegroundColor Yellow
$response = Read-Host "Deseja iniciar os containers Docker agora? (s/n)"

if ($response -match "^[sS]") {
    Write-Host ""
    Write-Host "🚀 Iniciando containers Docker..." -ForegroundColor Yellow
    try {
        docker-compose up -d
        Write-Host "✅ Containers iniciados com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Aguarde cerca de 10-15 segundos para a inicialização completa..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 Para ver os logs: docker-compose logs -f mongo" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Erro ao iniciar containers" -ForegroundColor Red
        Write-Host "💡 Tente executar manualmente: docker-compose up -d" -ForegroundColor Cyan
    }
}

# Informações finais
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Setup Concluído!" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📚 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Aguarde os containers iniciarem (10-15 segundos)"
Write-Host "   2. Verifique os logs: docker-compose logs -f mongo"
Write-Host "   3. Execute a interface gráfica: python mongo_client.py"
Write-Host "   4. Ou acesse Mongo Express: http://localhost:8081"
Write-Host "      - Usuário: admin"
Write-Host "      - Senha: admin"

Write-Host ""
Write-Host "👥 Usuários disponíveis:" -ForegroundColor Yellow
Write-Host "   • admin / admin (Root)"
Write-Host "   • appAdmin / adminPass123 (Admin)"
Write-Host "   • viewer / viewPass123 (Somente leitura)"
Write-Host "   • dataEntry / entryPass123 (Escrita)"
Write-Host "   • analyst / analystPass123 (Análise)"
Write-Host "   • restrictedUser / restrictPass123 (Restrito)"
Write-Host "   • developer / devPass123 (Dev)"

Write-Host ""
Write-Host "📖 Documentação:" -ForegroundColor Yellow
Write-Host "   • README.md - Documentação completa"
Write-Host "   • TESTES.md - Guia de testes detalhado"
Write-Host "   • ESPECIFICACAO.md - Especificação do projeto"
Write-Host "   • COMANDOS.md - Referência rápida de comandos"

Write-Host ""
Write-Host "🔧 Comandos úteis:" -ForegroundColor Yellow
Write-Host "   • docker-compose ps          - Ver status dos containers"
Write-Host "   • docker-compose logs -f     - Ver logs em tempo real"
Write-Host "   • docker-compose down        - Parar containers"
Write-Host "   • docker-compose down -v     - Resetar completamente"
Write-Host "   • python mongo_client.py     - Iniciar interface gráfica"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Pronto para usar! 🎉" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
