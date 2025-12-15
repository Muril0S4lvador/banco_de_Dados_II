# Database API - DynamoDB Local

Este projeto configura uma API para se conectar ao DynamoDB Local usando Docker Compose.

## Estrutura

- **dynamodb-local**: Serviço do DynamoDB rodando localmente na porta 8000
- **dynamodb-admin**: Interface administrativa web na porta 8001
- **database-api**: API que se conecta ao DynamoDB na porta 4444

## Configuração

### Variáveis de Ambiente

As seguintes variáveis de ambiente são configuradas automaticamente no docker-compose.yml:

- `SERVER_PORT`: Porta da API (4444)
- `AWS_REGION`: Região AWS (us-west-2)
- `AWS_ACCESS_KEY_ID`: Chave de acesso (local)
- `AWS_SECRET_ACCESS_KEY`: Chave secreta (local)
- `DYNAMODB_ENDPOINT`: Endpoint do DynamoDB local (http://dynamodb-local:8000)

### Conectando à API no DynamoDB

No código da sua API, use as variáveis de ambiente para configurar o cliente DynamoDB:

```javascript
// Exemplo Node.js com AWS SDK v3
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
```

```python
# Exemplo Python com boto3
import boto3
import os

dynamodb = boto3.resource(
    'dynamodb',
    endpoint_url=os.environ.get('DYNAMODB_ENDPOINT'),
    region_name=os.environ.get('AWS_REGION'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
)
```

## Como usar

1. Inicie os serviços:
```bash
docker-compose up -d
```

2. Acesse:
   - API: http://localhost:4444
   - DynamoDB Admin: http://localhost:8001
   - DynamoDB Local: http://localhost:8000

3. Para ver os logs:
```bash
docker-compose logs -f database-api
```

4. Para parar os serviços:
```bash
docker-compose down
```

## Tabelas

As tabelas são criadas e populadas automaticamente pelos scripts:
- `scripts_tables/create_tables.py` - Cria as tabelas
- `scripts_tables/populate_tables.py` - Popula com dados iniciais

Os dados das tabelas estão em `tables/*.json`.
