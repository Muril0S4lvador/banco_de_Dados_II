import { Request, Response } from "express";
import { ListTablesCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { RouteResponse } from "../helpers/RouteResponse";
import { dynamoDBBaseClient, dynamoDBClient } from "../config/database";

export class TableController {
    /**
     * @swagger
     * /tables:
     *   get:
     *     summary: Listar todas as tabelas com contagem de itens
     *     tags: [Tables]
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: Lista de tabelas retornada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       tableName:
     *                         type: string
     *                         example: "Users"
     *                       itemCount:
     *                         type: number
     *                         example: 42
     *                 message:
     *                   type: string
     *                   example: "Tabelas listadas com sucesso"
     *       '500':
     *         description: Erro ao listar tabelas
     */
    static async listTables(req: Request, res: Response) {
        try {
            // Lista todas as tabelas
            const listCommand = new ListTablesCommand({});
            const listResult = await dynamoDBBaseClient.send(listCommand);

            const tableNames = listResult.TableNames || [];
            const tablesWithCount = [];

            // Para cada tabela, busca a contagem de itens
            for (const tableName of tableNames) {
                try {
                    // Usa Scan para contar os itens (melhor para DynamoDB Local)
                    const scanCommand = new ScanCommand({
                        TableName: tableName,
                        Select: "COUNT"
                    });
                    const scanResult = await dynamoDBClient.send(scanCommand);

                    tablesWithCount.push({
                        tableName: tableName,
                        itemCount: scanResult.Count || 0
                    });
                } catch (error) {
                    console.error(`Error counting items in table ${tableName}:`, error);
                    tablesWithCount.push({
                        tableName: tableName,
                        itemCount: 0
                    });
                }
            }

            // Ordena alfabeticamente por nome da tabela
            tablesWithCount.sort((a, b) => a.tableName.localeCompare(b.tableName));

            return RouteResponse.success(res, tablesWithCount, 'Tabelas listadas com sucesso');
        } catch (error: any) {
            console.error('Error listing tables:', error);
            return RouteResponse.error(res, 'Erro ao listar tabelas: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /tables/names:
     *   get:
     *     summary: Listar apenas os nomes das tabelas
     *     tags: [Tables]
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: Lista de nomes das tabelas retornada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: string
     *                   example: ["Users", "Roles", "Tokens", "branch", "customer"]
     *                 message:
     *                   type: string
     *                   example: "Nomes das tabelas listados com sucesso"
     *       '500':
     *         description: Erro ao listar tabelas
     */
    static async listTableNames(req: Request, res: Response) {
        try {
            const command = new ListTablesCommand({});
            const result = await dynamoDBBaseClient.send(command);

            const tableNames = result.TableNames || [];
            tableNames.sort();

            return RouteResponse.success(res, tableNames, 'Nomes das tabelas listados com sucesso');
        } catch (error: any) {
            console.error('Error listing table names:', error);
            return RouteResponse.error(res, 'Erro ao listar nomes das tabelas: ' + error.message, 500);
        }
    }
}
