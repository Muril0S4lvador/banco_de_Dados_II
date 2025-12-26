import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { dynamoDBClient } from "./config/database";
import { swaggerConfig } from "./config/swagger";
import router from "./router";
import dotenv from "dotenv";

dotenv.config();

// Verificar conexão com DynamoDB
(async () => {
    try {
        // Tenta listar tabelas para verificar a conexão
        const { ListTablesCommand } = await import("@aws-sdk/client-dynamodb");
        const { dynamoDBBaseClient } = await import("./config/database");

        const result = await dynamoDBBaseClient.send(new ListTablesCommand({}));
        console.log("DynamoDB connected successfully!");
        console.log("Available tables:", result.TableNames);
    } catch (err) {
        console.error("DynamoDB Connection Error: ", err);
    }
})();

const app = express();

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Retorna 400 para corpo JSON inválido
app.use((err: any, _req: Request, res: Response, next: Function) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ success: false, message: 'JSON inválido no corpo da requisição' });
    }
    next(err);
});

app.use(cors({ origin: true }));
app.use(router);

const swaggerSpec = swaggerJSDoc(swaggerConfig);

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.get("/swagger.json", (_req: Request, res: Response) => {
    res.json(swaggerSpec);
});

console.log(`Add swagger on /swagger`);

const server = app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening on port ${process.env.SERVER_PORT}`);
});

export { app, server };