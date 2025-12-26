import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { Loan } from "../entity/Loan"
import { LoanRepository } from "../repository/LoanRepository"

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
    *         description: Lista de empréstimos
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
    *                       loan_number:
    *                         type: string
    *                       branch_name:
    *                         type: string
    *                       amount:
    *                         type: number
    *                       __id:
    *                         type: string
     */
    static async list(req: Request, res: Response) {
        try {
            const repository = new LoanRepository()
            const items = await repository.list()
            return RouteResponse.success(res, items, 'Itens listados com sucesso')
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
    *                     loan_number:
    *                       type: string
    *                     branch_name:
    *                       type: string
    *                     amount:
    *                       type: number
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
            const repository = new LoanRepository()
            const item = await repository.getById(itemId)
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
    *             required: [loan_number, branch_name, amount]
    *             properties:
    *               loan_number:
    *                 type: string
    *               branch_name:
    *                 type: string
    *               amount:
    *                 type: number
     *     responses:
     *       '201':
    *         description: Empréstimo criado
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
    *                     loan_number:
    *                       type: string
    *                     branch_name:
    *                       type: string
    *                     amount:
    *                       type: number
    *                     __id:
    *                       type: string
     */
    static async create(req: Request, res: Response) {
        try {
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { loan_number, branch_name, amount } = itemData
            if (typeof loan_number !== 'string' || typeof branch_name !== 'string' || typeof amount !== 'number' || Number.isNaN(amount)) {
                return RouteResponse.error(res, 'Tipos inválidos: loan_number (string), branch_name (string), amount (number) são obrigatórios', 400)
            }
            const repository = new LoanRepository()
            const created = await repository.create(itemData)
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
    *             properties:
    *               branch_name:
    *                 type: string
    *               amount:
    *                 type: number
     *     responses:
     *       '200':
    *         description: Empréstimo atualizado
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
    *                     loan_number:
    *                       type: string
    *                     branch_name:
    *                       type: string
    *                     amount:
    *                       type: number
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
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { branch_name, amount } = itemData
            if ((branch_name !== undefined && typeof branch_name !== 'string') || (amount !== undefined && (typeof amount !== 'number' || Number.isNaN(amount)))) {
                return RouteResponse.error(res, 'Tipos inválidos: branch_name deve ser string e amount deve ser number', 400)
            }
            const repository = new LoanRepository()
            const updated = await repository.update(itemId, itemData)
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
    *         description: Empréstimo deletado
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
            const repository = new LoanRepository()
            await repository.delete(itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting loan:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
