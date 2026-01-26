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
            # adiciona um id lógico para tabelas que só têm FKs (borrower, depositor)
            if table_name in ("borrower", "depositor"):
                for entry in items:
                    item = entry.get("PutRequest", {}).get("Item", {})
                    if table_name == "borrower":
                        customer = item.get("customer_name", {}).get("S")
                        loan = item.get("loan_number", {}).get("S")
                        if customer and loan:
                            item["id"] = {"S": f"{customer}::{loan}"}
                    if table_name == "depositor":
                        customer = item.get("customer_name", {}).get("S")
                        account = item.get("account_number", {}).get("S")
                        if customer and account:
                            item["id"] = {"S": f"{customer}::{account}"}

            print(f"➡️  Inserindo {len(items)} itens na tabela '{table_name}'...")
            batch_write(table_name, items)
    print("✓ População concluída com sucesso!")

if __name__ == "__main__":
    populate()
