import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { DynamoTableHelper } from "../helpers/DynamoTableHelper"
import { Customer } from "../entity/Customer"

export class CustomerController {
    private static tableName = 'customer'

    /**
     * @swagger
     * /customer:
     *   get:
     *     summary: Listar clientes
     *     tags: [Customer]
     *     responses:
     *       '200':
     *         description: Lista de itens
     */
    static async list(req: Request, res: Response) {
        try {
            const result = await DynamoTableHelper.listItems<Customer>(this.tableName)
            return RouteResponse.success(res, result.items, 'Itens listados com sucesso')
        } catch (error: any) {
            console.error('Error listing customer:', error)
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /customer/{itemId}:
     *   get:
     *     summary: Buscar cliente
     *     tags: [Customer]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Item encontrado
     *       '404':
     *         description: Não encontrado
     */
    static async get(req: Request, res: Response) {
        try {
            const { itemId } = req.params
            const item = await DynamoTableHelper.getItem<Customer>(this.tableName, itemId)
            if (!item) return RouteResponse.error(res, 'Item não encontrado', 404)
            return RouteResponse.success(res, item, 'Item encontrado')
        } catch (error: any) {
            console.error('Error getting customer:', error)
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /customer:
     *   post:
     *     summary: Criar cliente
     *     tags: [Customer]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       '201':
     *         description: Item criado
     */
    static async create(req: Request, res: Response) {
        try {
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const created = await DynamoTableHelper.createItem<Customer>(this.tableName, itemData)
            return RouteResponse.success(res, created, 'Item criado com sucesso', 201)
        } catch (error: any) {
            console.error('Error creating customer:', error)
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /customer/{itemId}:
     *   put:
     *     summary: Atualizar cliente
     *     tags: [Customer]
     *     parameters:
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
     *         description: Item atualizado
     */
    static async update(req: Request, res: Response) {
        try {
            const { itemId } = req.params
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const updated = await DynamoTableHelper.updateItem<Customer>(this.tableName, itemId, itemData)
            return RouteResponse.success(res, updated, 'Item atualizado com sucesso')
        } catch (error: any) {
            console.error('Error updating customer:', error)
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /customer/{itemId}:
     *   delete:
     *     summary: Deletar cliente
     *     tags: [Customer]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Item deletado
     */
    static async delete(req: Request, res: Response) {
        try {
            const { itemId } = req.params
            await DynamoTableHelper.deleteItem(this.tableName, itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting customer:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
