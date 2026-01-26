import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { Account } from "../entity/Account"
import { AccountRepository } from "../repository/AccountRepository"

export class AccountController {
    private static tableName = 'account'

    /**
     * @swagger
     * /account:
     *   get:
     *     summary: Listar contas
     *     tags: [Account]
     *     responses:
     *       '200':
    *         description: Lista de contas
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
    *                       account_number:
    *                         type: string
    *                       branch_name:
    *                         type: string
    *                       balance:
    *                         type: number
    *                       __id:
    *                         type: string
     */
    static async list(req: Request, res: Response) {
        try {
            const repository = new AccountRepository()
            const items = await repository.list()
            return RouteResponse.success(res, items, 'Itens listados com sucesso')
        } catch (error: any) {
            console.error('Error listing account:', error)
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /account/{itemId}:
     *   get:
     *     summary: Buscar conta
     *     tags: [Account]
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
    *                     account_number:
    *                       type: string
    *                     branch_name:
    *                       type: string
    *                     balance:
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
            const repository = new AccountRepository()
            const item = await repository.getById(itemId)
            if (!item) return RouteResponse.error(res, 'Item não encontrado', 404)
            return RouteResponse.success(res, item, 'Item encontrado')
        } catch (error: any) {
            console.error('Error getting account:', error)
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /account:
     *   post:
     *     summary: Criar conta
     *     tags: [Account]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
    *             type: object
    *             required: [account_number, branch_name, balance]
    *             properties:
    *               account_number:
    *                 type: string
    *               branch_name:
    *                 type: string
    *               balance:
    *                 type: number
     *     responses:
     *       '201':
    *         description: Conta criada
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
    *                     account_number:
    *                       type: string
    *                     branch_name:
    *                       type: string
    *                     balance:
    *                       type: number
    *                     __id:
    *                       type: string
     */
    static async create(req: Request, res: Response) {
        try {
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { account_number, branch_name, balance } = itemData
            if (typeof account_number !== 'string' || typeof branch_name !== 'string' || typeof balance !== 'number' || Number.isNaN(balance)) {
                return RouteResponse.error(res, 'Tipos inválidos: account_number (string), branch_name (string), balance (number) são obrigatórios', 400)
            }
            const repository = new AccountRepository()
            const created = await repository.create(itemData)
            return RouteResponse.success(res, created, 'Item criado com sucesso', 201)
        } catch (error: any) {
            console.error('Error creating account:', error)
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /account/{itemId}:
     *   put:
     *     summary: Atualizar conta
     *     tags: [Account]
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
    *               balance:
    *                 type: number
     *     responses:
     *       '200':
    *         description: Conta atualizada
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
    *                     account_number:
    *                       type: string
    *                     branch_name:
    *                       type: string
    *                     balance:
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
            const { branch_name, balance } = itemData
            if ((branch_name !== undefined && typeof branch_name !== 'string') || (balance !== undefined && (typeof balance !== 'number' || Number.isNaN(balance)))) {
                return RouteResponse.error(res, 'Tipos inválidos: branch_name deve ser string e balance deve ser number', 400)
            }
            const repository = new AccountRepository()
            const updated = await repository.update(itemId, itemData)
            return RouteResponse.success(res, updated, 'Item atualizado com sucesso')
        } catch (error: any) {
            console.error('Error updating account:', error)
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /account/{itemId}:
     *   delete:
     *     summary: Deletar conta
     *     tags: [Account]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
    *         description: Conta deletada
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
            const repository = new AccountRepository()
            await repository.delete(itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting account:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
