# Imagem base Python
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias para customtkinter e X11
RUN apt-get update && apt-get install -y \
    tk \
    python3-tk \
    libx11-6 \
    libxext6 \
    libxrender1 \
    libxft2 \
    libxinerama1 \
    libxi6 \
    libxrandr2 \
    libxcursor1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivo de dependências
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY mongo_client.py .

# Comando padrão para executar a aplicação
CMD ["python", "mongo_client.py"]
