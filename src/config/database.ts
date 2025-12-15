import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-west-2",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://dynamodb-local:8000",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
    },
});

// Cliente de documento para operações simplificadas
export const dynamoDBClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
    },
    unmarshallOptions: {
        wrapNumbers: false,
    },
});

// Cliente base para operações de tabela
export const dynamoDBBaseClient = client;