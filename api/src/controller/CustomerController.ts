import { Request, Response } from "express"
import { RouteResponse } from "../helpers/RouteResponse"
import { Customer } from "../entity/Customer"
import { CustomerRepository } from "../repository/CustomerRepository"

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
    *         description: Lista de clientes
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
    *                       customer_street:
    *                         type: string
    *                       customer_city:
    *                         type: string
    *                       __id:
    *                         type: string
     */
    static async list(req: Request, res: Response) {
        try {
            const repository = new CustomerRepository()
            const items = await repository.list()
            return RouteResponse.success(res, items, 'Itens listados com sucesso')
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
    *                     customer_street:
    *                       type: string
    *                     customer_city:
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
            const repository = new CustomerRepository()
            const item = await repository.getById(itemId)
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
    *             required: [customer_name, customer_street, customer_city]
    *             properties:
    *               customer_name:
    *                 type: string
    *               customer_street:
    *                 type: string
    *               customer_city:
    *                 type: string
     *     responses:
     *       '201':
    *         description: Cliente criado
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
    *                     customer_street:
    *                       type: string
    *                     customer_city:
    *                       type: string
    *                     __id:
    *                       type: string
     */
    static async create(req: Request, res: Response) {
        try {
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { customer_name, customer_street, customer_city } = itemData
            if (typeof customer_name !== 'string' || typeof customer_street !== 'string' || typeof customer_city !== 'string') {
                return RouteResponse.error(res, 'Tipos inválidos: customer_name, customer_street e customer_city devem ser strings', 400)
            }
            const repository = new CustomerRepository()
            const created = await repository.create(itemData)
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
    *             properties:
    *               customer_street:
    *                 type: string
    *               customer_city:
    *                 type: string
     *     responses:
     *       '200':
    *         description: Cliente atualizado
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
    *                     customer_street:
    *                       type: string
    *                     customer_city:
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
            const itemData = req.body
            if (!itemData || Object.keys(itemData).length === 0) return RouteResponse.error(res, 'Dados do item são obrigatórios', 400)
            const { customer_street, customer_city } = itemData
            if ((customer_street !== undefined && typeof customer_street !== 'string') || (customer_city !== undefined && typeof customer_city !== 'string')) {
                return RouteResponse.error(res, 'Tipos inválidos: customer_street e customer_city devem ser strings', 400)
            }
            const repository = new CustomerRepository()
            const updated = await repository.update(itemId, itemData)
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
    *         description: Cliente deletado
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
            const repository = new CustomerRepository()
            await repository.delete(itemId)
            return RouteResponse.success(res, { message: 'Item deletado com sucesso' })
        } catch (error: any) {
            console.error('Error deleting customer:', error)
            return RouteResponse.error(res, 'Erro ao deletar item: ' + error.message, 500)
        }
    }
}
