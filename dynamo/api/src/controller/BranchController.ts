import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { Branch } from "../entity/Branch"
import { BranchRepository } from "../repository/BranchRepository"

export class BranchController {
    private static tableName = 'branch'

    /**
     * @swagger
     * /branch:
     *   get:
     *     summary: Listar branches
     *     tags: [Branch]
     *     responses:
     *       '200':
    *         description: Lista de branches
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
    *                       branch_name:
    *                         type: string
    *                       branch_city:
    *                         type: string
    *                       assets:
    *                         type: number
    *                       __id:
    *                         type: string
     */
    static async list(req: Request, res: Response) {
        try {
            const repository = new BranchRepository()
            const items = await repository.list()
            return RouteResponse.success(res, items, 'Itens listados com sucesso')
        } catch (error: any) {
            console.error('Error listing branch:', error)
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /branch/{itemId}:
     *   get:
     *     summary: Buscar branch
     *     tags: [Branch]
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
    *                     branch_name:
    *                       type: string
    *                     branch_city:
    *                       type: string
    *                     assets:
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
            const repository = new BranchRepository()
            const item = await repository.getById(itemId)
            if (!item) return RouteResponse.error(res, 'Item não encontrado', 404)
            return RouteResponse.success(res, item, 'Item encontrado')
        } catch (error: any) {
            console.error('Error getting branch:', error)
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /branch:
     *   post:
     *     summary: Criar branch
     *     tags: [Branch]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
    *             type: object
    *             required: [branch_name, branch_city, assets]
    *             properties:
    *               branch_name:
    *                 type: string
    *               branch_city:
    *                 type: string
    *               assets:
    *                 type: number
     *     responses:
     *       '201':
    *         description: Branch criada
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
    *                     branch_name:
    *                       type: string
    *                     branch_city:
    *                       type: string
    *                     assets:
    *                       type: number
    *                     __id:
    *                       type: string
     */
    static async create(req: Request, res: Response) {
        try {
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { branch_name, branch_city, assets } = itemData
            if (typeof branch_name !== 'string' || typeof branch_city !== 'string' || typeof assets !== 'number' || Number.isNaN(assets)) {
                return RouteResponse.error(res, 'Tipos inválidos: branch_name (string), branch_city (string), assets (number) são obrigatórios', 400)
            }
            const repository = new BranchRepository()
            const created = await repository.create(itemData)
            return RouteResponse.success(res, created, 'Item criado com sucesso', 201)
        } catch (error: any) {
            console.error('Error creating branch:', error)
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /branch/{itemId}:
     *   put:
     *     summary: Atualizar branch
     *     tags: [Branch]
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
    *               branch_city:
    *                 type: string
    *               assets:
    *                 type: number
     *     responses:
     *       '200':
    *         description: Branch atualizada
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
    *                     branch_name:
    *                       type: string
    *                     branch_city:
    *                       type: string
    *                     assets:
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
            const { branch_city, assets } = itemData
            if ((branch_city !== undefined && typeof branch_city !== 'string') || (assets !== undefined && (typeof assets !== 'number' || Number.isNaN(assets)))) {
                return RouteResponse.error(res, 'Tipos inválidos: branch_city deve ser string e assets deve ser number', 400)
            }
            const repository = new BranchRepository()
            const updated = await repository.update(itemId, itemData)
            return RouteResponse.success(res, updated, 'Item atualizado com sucesso')
        } catch (error: any) {
            console.error('Error updating branch:', error)
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /branch/{itemId}:
     *   delete:
     *     summary: Deletar branch
     *     tags: [Branch]
     *     parameters:
     *       - name: itemId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
    *         description: Branch deletada
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
            const repository = new BranchRepository()
            await repository.delete(itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting branch:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
