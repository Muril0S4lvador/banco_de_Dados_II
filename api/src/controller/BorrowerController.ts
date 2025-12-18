import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { DynamoTableHelper } from "../helpers/DynamoTableHelper"
import { Borrower } from "../entity/Borrower"

export class BorrowerController {
    private static tableName = 'borrower'

    /**
     * @swagger
     * /borrower:
     *   get:
     *     summary: Listar borrowers
     *     tags: [Borrower]
     *     responses:
     *       '200':
     *         description: Lista de itens
     */
    static async list(req: Request, res: Response) {
        try {
            const result = await DynamoTableHelper.listItems<Borrower>(this.tableName)
            return RouteResponse.success(res, result.items, 'Itens listados com sucesso')
        } catch (error: any) {
            console.error('Error listing borrower:', error)
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /borrower/{itemId}:
     *   get:
     *     summary: Buscar borrower
     *     tags: [Borrower]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         description: "customer_name::loan_number"
     *     responses:
     *       '200':
     *         description: Item encontrado
     *       '404':
     *         description: Não encontrado
     */
    static async get(req: Request, res: Response) {
        try {
            const { itemId } = req.params
            const item = await DynamoTableHelper.getItem<Borrower>(this.tableName, itemId)
            if (!item) return RouteResponse.error(res, 'Item não encontrado', 404)
            return RouteResponse.success(res, item, 'Item encontrado')
        } catch (error: any) {
            console.error('Error getting borrower:', error)
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /borrower:
     *   post:
     *     summary: Criar borrower
     *     tags: [Borrower]
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
            const created = await DynamoTableHelper.createItem<Borrower>(this.tableName, itemData)
            return RouteResponse.success(res, created, 'Item criado com sucesso', 201)
        } catch (error: any) {
            console.error('Error creating borrower:', error)
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /borrower/{itemId}:
     *   put:
     *     summary: Atualizar borrower
     *     tags: [Borrower]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         description: "customer_name::loan_number"
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
            const updated = await DynamoTableHelper.updateItem<Borrower>(this.tableName, itemId, itemData)
            return RouteResponse.success(res, updated, 'Item atualizado com sucesso')
        } catch (error: any) {
            console.error('Error updating borrower:', error)
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /borrower/{itemId}:
     *   delete:
     *     summary: Deletar borrower
     *     tags: [Borrower]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         description: "customer_name::loan_number"
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
            console.error('Error deleting borrower:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
