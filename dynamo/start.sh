#!/bin/sh

# Inicia a API em background
cd /app/api && node_modules/.bin/ts-node src/app.ts &

# Aguarda um pouco para a API iniciar
sleep 2

# Serve o frontend
serve -s /app/frontend/dist -l ${CLIENT_PORT:-3000}
