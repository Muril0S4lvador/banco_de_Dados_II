import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { Permission } from "../entity/Permission"
import { PermissionRepository } from "../repository/PermissionRepository"

export class PermissionTableController {
    private static tableName = 'Permissions'

    /**
     * @swagger
     * /permission:
     *   get:
     *     summary: Listar permissões
     *     tags: [Permission]
     *     responses:
     *       '200':
     *         description: Lista de itens
     */
    static async list(req: Request, res: Response) {
        try {
            const repository = new PermissionRepository()
            const items = await repository.list()
            return RouteResponse.success(res, items, 'Itens listados com sucesso')
        } catch (error: any) {
            console.error('Error listing permission:', error)
            return RouteResponse.error(res, 'Erro ao listar itens: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /permission/{itemId}:
     *   get:
     *     summary: Buscar permissão
     *     tags: [Permission]
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
            const repository = new PermissionRepository()
            const item = await repository.getById(itemId)
            if (!item) return RouteResponse.error(res, 'Item não encontrado', 404)
            return RouteResponse.success(res, item, 'Item encontrado')
        } catch (error: any) {
            console.error('Error getting permission:', error)
            return RouteResponse.error(res, 'Erro ao buscar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /permission:
     *   post:
     *     summary: Criar permissão
     *     tags: [Permission]
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
            const repository = new PermissionRepository()
            const created = await repository.create(itemData)
            return RouteResponse.success(res, created, 'Item criado com sucesso', 201)
        } catch (error: any) {
            console.error('Error creating permission:', error)
            return RouteResponse.error(res, 'Erro ao criar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /permission/{itemId}:
     *   put:
     *     summary: Atualizar permissão
     *     tags: [Permission]
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
            const repository = new PermissionRepository()
            const updated = await repository.update(itemId, itemData)
            return RouteResponse.success(res, updated, 'Item atualizado com sucesso')
        } catch (error: any) {
            console.error('Error updating permission:', error)
            return RouteResponse.error(res, 'Erro ao atualizar item: ' + error.message, 500)
        }
    }

    /**
     * @swagger
     * /permission/{itemId}:
     *   delete:
     *     summary: Deletar permissão
     *     tags: [Permission]
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
            const repository = new PermissionRepository()
            await repository.delete(itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting permission:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
