import json
import boto3
from botocore.exceptions import ClientError

path = "./tables"

with open(f"{path}/tables.json") as f:
    tables = json.load(f)

dynamodb = boto3.client(
    "dynamodb",
    endpoint_url="http://localhost:8000",  # DynamoDB local
    region_name="us-east-1",
    aws_access_key_id="dummy",
    aws_secret_access_key="dummy"
)

for table in tables:
    name = table['name']
    print(f">> Criando tabela: {name}")

    params = {
        "TableName": name,
        "AttributeDefinitions": table["attributeDefinitions"],
        "KeySchema": table["keySchema"],
        "BillingMode": table["billingMode"]
    }

    try:
        dynamodb.create_table(**params)
        print(f"   ✓ Tabela '{name}' criada com sucesso.")

    except ClientError as e:
        if e.response['Error']['Code'] == "ResourceInUseException":
            # Código de erro oficial quando a tabela já existe
            print(f"   ⚠️  Tabela '{name}' já existe. Pulando...")
        else:
            print(f"   ❌ Erro ao criar tabela '{name}': {e}")
            raise  # Se for outro erro, pare a execução

print("✓ Processo concluído")
