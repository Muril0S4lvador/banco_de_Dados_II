import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { DynamoTableHelper } from "../helpers/DynamoTableHelper"
import { Loan } from "../entity/Loan"

export class LoanController {
    private static tableName = 'loan'

    /**
     * @swagger
     * /loan:
     *   get:
     *     summary: Listar empréstimos
     *     tags: [Loan]
     *     responses:
     *       '200':
     *         description: Lista de itens
     */
    static async list(req: Request, res: Response) {
        try {
            const result = await DynamoTableHelper.listItems<Loan>(this.tableName)
            return RouteResponse.success(res, result.items, 'Itens listados com sucesso')
        } catch (error: any) {
            console.error('Error listing loan:', error)
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /loan/{itemId}:
     *   get:
     *     summary: Buscar empréstimo
     *     tags: [Loan]
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
            const item = await DynamoTableHelper.getItem<Loan>(this.tableName, itemId)
            if (!item) return RouteResponse.error(res, 'Item não encontrado', 404)
            return RouteResponse.success(res, item, 'Item encontrado')
        } catch (error: any) {
            console.error('Error getting loan:', error)
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /loan:
     *   post:
     *     summary: Criar empréstimo
     *     tags: [Loan]
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
            const created = await DynamoTableHelper.createItem<Loan>(this.tableName, itemData)
            return RouteResponse.success(res, created, 'Item criado com sucesso', 201)
        } catch (error: any) {
            console.error('Error creating loan:', error)
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /loan/{itemId}:
     *   put:
     *     summary: Atualizar empréstimo
     *     tags: [Loan]
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
            const updated = await DynamoTableHelper.updateItem<Loan>(this.tableName, itemId, itemData)
            return RouteResponse.success(res, updated, 'Item atualizado com sucesso')
        } catch (error: any) {
            console.error('Error updating loan:', error)
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /loan/{itemId}:
     *   delete:
     *     summary: Deletar empréstimo
     *     tags: [Loan]
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
            console.error('Error deleting loan:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
