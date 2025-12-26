import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { Borrower } from "../entity/Borrower"
import { BorrowerRepository } from "../repository/BorrowerRepository"

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
    *         description: Lista de borrowers
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
    *                       id:
    *                         type: string
    *                       customer_name:
    *                         type: string
    *                       loan_number:
    *                         type: string
    *                       __id:
    *                         type: string
     */
    static async list(req: Request, res: Response) {
        try {
            const repository = new BorrowerRepository()
            const items = await repository.list()
            return RouteResponse.success(res, items, 'Itens listados com sucesso')
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
    *         description: ID do borrower
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
    *                     id:
    *                       type: string
    *                     customer_name:
    *                       type: string
    *                     loan_number:
    *                       type: string
    *                     __id:
    *                       type: string
     *       '404':
     *         description: Não encontrado
     */
    static async get(req: Request, res: Response) {
        try {
            let itemId: string
            try {
                itemId = decodeURIComponent(req.params.itemId)
            } catch (err) {
                return RouteResponse.error(res, 'itemId inválido', 400)
            }
            if (!itemId) return RouteResponse.error(res, 'itemId é obrigatório', 400)
            if (itemId.split('::').length !== 2) return RouteResponse.error(res, 'itemId inválido, esperado "customer_name::loan_number"', 400)
            const repository = new BorrowerRepository()
            const item = await repository.getById(itemId)
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
    *             required: [customer_name, loan_number]
    *             properties:
    *               customer_name:
    *                 type: string
    *               loan_number:
    *                 type: string
     *     responses:
     *       '201':
    *         description: Borrower criado
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
    *                     id:
    *                       type: string
    *                     customer_name:
    *                       type: string
    *                     loan_number:
    *                       type: string
    *                     __id:
    *                       type: string
     */
    static async create(req: Request, res: Response) {
        try {
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { customer_name, loan_number } = itemData
            if (typeof customer_name !== 'string' || typeof loan_number !== 'string') {
                return RouteResponse.error(res, 'Tipos inválidos: customer_name e loan_number devem ser strings', 400)
            }
            const repository = new BorrowerRepository()
            const created = await repository.create(itemData)
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
    *         description: ID do borrower
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
    *             type: object
    *             properties:
    *               customer_name:
    *                 type: string
    *               loan_number:
    *                 type: string
     *     responses:
     *       '200':
    *         description: Borrower atualizado
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
    *                     id:
    *                       type: string
    *                     customer_name:
    *                       type: string
    *                     loan_number:
    *                       type: string
    *                     __id:
    *                       type: string
     */
    static async update(req: Request, res: Response) {
        try {
            let itemId: string
            try {
                itemId = decodeURIComponent(req.params.itemId)
            } catch (err) {
                return RouteResponse.error(res, 'itemId inválido', 400)
            }
            if (!itemId) return RouteResponse.error(res, 'itemId é obrigatório', 400)
            if (itemId.split('::').length !== 2) return RouteResponse.error(res, 'itemId inválido, esperado "customer_name::loan_number"', 400)
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { customer_name, loan_number } = itemData
            if ((customer_name !== undefined && typeof customer_name !== 'string') || (loan_number !== undefined && typeof loan_number !== 'string')) {
                return RouteResponse.error(res, 'Tipos inválidos: customer_name e loan_number devem ser strings', 400)
            }
            const repository = new BorrowerRepository()
            const updated = await repository.update(itemId, itemData)
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
    *         description: ID do borrower
     *     responses:
     *       '200':
    *         description: Borrower deletado
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
            let itemId: string
            try {
                itemId = decodeURIComponent(req.params.itemId)
            } catch (err) {
                return RouteResponse.error(res, 'itemId inválido', 400)
            }
            if (!itemId) return RouteResponse.error(res, 'itemId é obrigatório', 400)
            if (itemId.split('::').length !== 2) return RouteResponse.error(res, 'itemId inválido, esperado "customer_name::loan_number"', 400)
            const repository = new BorrowerRepository()
            await repository.delete(itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting borrower:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
