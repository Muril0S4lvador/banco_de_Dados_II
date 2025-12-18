import { Request, Response } from "express";
import { RouteResponse } from "../helpers/RouteResponse";
import { ScanCommand, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DescribeTableCommand, KeySchemaElement } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'crypto';
import { dynamoDBClient } from '../config/database';

export class TableItemController {
    private static async getKeySchema(tableName: string): Promise<KeySchemaElement[]> {
        const describe = new DescribeTableCommand({ TableName: tableName });
        const result = await dynamoDBClient.send(describe);
        return result.Table?.KeySchema || [];
    }

    private static buildItemId(item: Record<string, any>, keySchema: KeySchemaElement[]): string {
        if (!keySchema || keySchema.length === 0) return '';
        const hashKey = keySchema.find(k => k.KeyType === 'HASH')?.AttributeName;
        const rangeKey = keySchema.find(k => k.KeyType === 'RANGE')?.AttributeName;

        const parts = [] as string[];
        if (hashKey) parts.push(String(item[hashKey]));
        if (rangeKey) parts.push(String(item[rangeKey]));

        return parts.join('::');
    }

    private static buildKeyFromItemId(itemId: string, keySchema: KeySchemaElement[]): Record<string, any> {
        const hashKey = keySchema.find(k => k.KeyType === 'HASH')?.AttributeName;
        const rangeKey = keySchema.find(k => k.KeyType === 'RANGE')?.AttributeName;

        const parts = itemId.split('::');
        const key: Record<string, any> = {};

        if (hashKey) {
            key[hashKey] = parts[0];
        }
        if (rangeKey && parts.length > 1) {
            key[rangeKey] = parts[1];
        }

        return key;
    }

    /**
     * @swagger
     * /table/{tableName}/items:
     *   get:
     *     summary: Listar todos os itens de uma tabela
     *     tags: [Table Items]
     *     parameters:
     *       - name: tableName
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Lista de itens
     */
    static async listItems(req: Request, res: Response) {
        try {
            const { tableName } = req.params;
            const keySchema = await this.getKeySchema(tableName);

            const command = new ScanCommand({ TableName: tableName });
            const result = await dynamoDBClient.send(command);

            const itemsWithId = (result.Items || []).map((item: Record<string, any>) => ({
                ...item,
                __id: this.buildItemId(item, keySchema),
            }));

            return RouteResponse.success(res, itemsWithId, 'Itens listados com sucesso');
        } catch (error: any) {
            console.error('Error listing items:', error);
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /table/{tableName}/item:
     *   post:
     *     summary: Criar novo item na tabela
     *     tags: [Table Items]
     *     parameters:
     *       - name: tableName
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       '201':
     *         description: Item criado com sucesso
     */
    static async createItem(req: Request, res: Response) {
        try {
            const { tableName } = req.params;
            const itemData = req.body;
            const keySchema = await this.getKeySchema(tableName);

            if (!itemData || Object.keys(itemData).length === 0) {
                return RouteResponse.error(res, 'Dados do item são obrigatórios', 400);
            }

            // Gera valores para as chaves primárias caso não tenham sido enviadas
            keySchema.forEach(key => {
                if (!itemData[key.AttributeName!]) {
                    itemData[key.AttributeName!] = randomUUID();
                }
            });

            const command = new PutCommand({
                TableName: tableName,
                Item: itemData
            });

            await dynamoDBClient.send(command);

            const itemWithId = {
                ...itemData,
                __id: this.buildItemId(itemData, keySchema),
            };

            return RouteResponse.success(res, itemWithId, 'Item criado com sucesso', 201);
        } catch (error: any) {
            console.error('Error creating item:', error);
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /table/{tableName}/item/{itemId}:
     *   get:
     *     summary: Buscar item específico
     *     tags: [Table Items]
     *     parameters:
     *       - name: tableName
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Item encontrado
     */
    static async getItem(req: Request, res: Response) {
        try {
            const { tableName, itemId } = req.params;
            const keySchema = await this.getKeySchema(tableName);
            const key = this.buildKeyFromItemId(itemId, keySchema);

            const command = new GetCommand({
                TableName: tableName,
                Key: key,
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Item) {
                return RouteResponse.error(res, 'Item não encontrado', 404);
            }

            const itemWithId = {
                ...result.Item,
                __id: this.buildItemId(result.Item, keySchema),
            };

            return RouteResponse.success(res, itemWithId, 'Item encontrado');
        } catch (error: any) {
            console.error('Error getting item:', error);
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /table/{tableName}/item/{itemId}:
     *   put:
     *     summary: Atualizar item
     *     tags: [Table Items]
     *     parameters:
     *       - name: tableName
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       '200':
     *         description: Item atualizado com sucesso
     */
    static async updateItem(req: Request, res: Response) {
        try {
            const { tableName, itemId } = req.params;
            const itemData = req.body;
            const keySchema = await this.getKeySchema(tableName);

            if (!itemData || Object.keys(itemData).length === 0) {
                return RouteResponse.error(res, 'Dados do item são obrigatórios', 400);
            }

            const key = this.buildKeyFromItemId(itemId, keySchema);
            const mergedItem = { ...itemData, ...key };

            const command = new PutCommand({
                TableName: tableName,
                Item: mergedItem
            });

            await dynamoDBClient.send(command);

            const itemWithId = {
                ...mergedItem,
                __id: this.buildItemId(mergedItem, keySchema),
            };

            return RouteResponse.success(res, itemWithId, 'Item atualizado com sucesso');
        } catch (error: any) {
            console.error('Error updating item:', error);
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /table/{tableName}/item/{itemId}:
     *   delete:
     *     summary: Deletar item
     *     tags: [Table Items]
     *     parameters:
     *       - name: tableName
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Item deletado com sucesso
     */
    static async deleteItem(req: Request, res: Response) {
        try {
            const { tableName, itemId } = req.params;
            const keySchema = await this.getKeySchema(tableName);
            const key = this.buildKeyFromItemId(itemId, keySchema);

            const command = new DeleteCommand({
                TableName: tableName,
                Key: key,
            });

            await dynamoDBClient.send(command);

            return RouteResponse.success(res, { message: 'Item deletado com sucesso' });
        } catch (error: any) {
            console.error('Error deleting item:', error);
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500);
        }
    }
}
