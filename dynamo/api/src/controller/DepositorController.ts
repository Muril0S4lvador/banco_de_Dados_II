import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { Depositor } from "../entity/Depositor"
import { DepositorRepository } from "../repository/DepositorRepository"

export class DepositorController {
    private static tableName = 'depositor'

    /**
     * @swagger
     * /depositor:
     *   get:
     *     summary: Listar depositantes
     *     tags: [Depositor]
     *     responses:
     *       '200':
     *         description: Lista de depositantes
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       customer_name:
     *                         type: string
     *                       account_number:
     *                         type: string
     *                       __id:
     *                         type: string
     */
    static async list(req: Request, res: Response) {
        try {
            const repository = new DepositorRepository()
            const items = await repository.list()
            return RouteResponse.success(res, items, 'Itens listados com sucesso')
        } catch (error: any) {
            console.error('Error listing depositor:', error)
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /depositor/{itemId}:
     *   get:
     *     summary: Buscar depositante
     *     tags: [Depositor]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         description: "customer_name::account_number"
     *     responses:
     *       '200':
     *         description: Item encontrado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     customer_name:
     *                       type: string
     *                     account_number:
     *                       type: string
     *                     __id:
     *                       type: string
     *       '404':
     *         description: Não encontrado
     */
    static async get(req: Request, res: Response) {
        try {
            const { itemId } = req.params
            const repository = new DepositorRepository()
            const item = await repository.getById(itemId)
            if (!item) return RouteResponse.error(res, 'Item não encontrado', 404)
            return RouteResponse.success(res, item, 'Item encontrado')
        } catch (error: any) {
            console.error('Error getting depositor:', error)
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /depositor:
     *   post:
     *     summary: Criar depositante
     *     tags: [Depositor]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [customer_name, account_number]
     *             properties:
     *               customer_name:
     *                 type: string
     *               account_number:
     *                 type: string
     *     responses:
     *       '201':
     *         description: Depositante criado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     customer_name:
     *                       type: string
     *                     account_number:
     *                       type: string
     *                     __id:
     *                       type: string
     */
    static async create(req: Request, res: Response) {
        try {
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const repository = new DepositorRepository()
            const created = await repository.create(itemData)
            return RouteResponse.success(res, created, 'Item criado com sucesso', 201)
        } catch (error: any) {
            console.error('Error creating depositor:', error)
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /depositor/{itemId}:
     *   put:
     *     summary: Atualizar depositante
     *     tags: [Depositor]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         description: "customer_name::account_number"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               customer_name:
     *                 type: string
     *               account_number:
     *                 type: string
     *     responses:
     *       '200':
     *         description: Depositante atualizado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     customer_name:
     *                       type: string
     *                     account_number:
     *                       type: string
     *                     __id:
     *                       type: string
     */
    static async update(req: Request, res: Response) {
        try {
            const { itemId } = req.params
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const repository = new DepositorRepository()
            const updated = await repository.update(itemId, itemData)
            return RouteResponse.success(res, updated, 'Item atualizado com sucesso')
        } catch (error: any) {
            console.error('Error updating depositor:', error)
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /depositor/{itemId}:
     *   delete:
     *     summary: Deletar depositante
     *     tags: [Depositor]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         description: "customer_name::account_number"
     *     responses:
     *       '200':
     *         description: Depositante deletado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     message:
     *                       type: string
     */
    static async delete(req: Request, res: Response) {
        try {
            const { itemId } = req.params
            const repository = new DepositorRepository()
            await repository.delete(itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting depositor:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
