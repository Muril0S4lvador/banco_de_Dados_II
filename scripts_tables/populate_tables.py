import json
import boto3
from botocore.exceptions import ClientError
import hashlib

DATA_PATH = "./tables/"  # ajuste para o path no container
DATA_FILE = [
    f"{DATA_PATH}/account_batch.json",
    f"{DATA_PATH}/borrower_batch.json",
    f"{DATA_PATH}/branch_batch.json",
    f"{DATA_PATH}/customer_batch.json",
    f"{DATA_PATH}/depositor_batch.json",
    f"{DATA_PATH}/loan_batch.json",
    f"{DATA_PATH}/user_batch.json",
]

dynamodb = boto3.client(
    "dynamodb",
    endpoint_url="http://localhost:8000",
    region_name="us-west-2",
    aws_access_key_id="local",
    aws_secret_access_key="local"
)

def batch_write(table_name, items):
    """
    Envia itens para a tabela usando BatchWriteItem.
    """
    try:
        request_items = {table_name: items}
        response = dynamodb.batch_write_item(RequestItems=request_items)

        # Se houver itens não processados, tenta novamente
        unprocessed = response.get("UnprocessedItems", {})
        while unprocessed:
            print(f"⚠️  Reenviando {len(unprocessed.get(table_name, []))} itens não processados...")
            response = dynamodb.batch_write_item(RequestItems=unprocessed)
            unprocessed = response.get("UnprocessedItems", {})

    except ClientError as e:
        print(f"Erro ao inserir na tabela {table_name}: {e}")

def populate():
    for data_file in DATA_FILE:
        with open(data_file, "r") as f:
            data = json.load(f)

        for table_name, items in data.items():
            print(f"➡️  Inserindo {len(items)} itens na tabela '{table_name}'...")
            batch_write(table_name, items)
    print("✓ População concluída com sucesso!")

if __name__ == "__main__":
    populate()
