import api from '../lib/axios'

export interface TableItem {
    [key: string]: any
}

export interface ListItemsResponse {
    items: TableItem[]
    count: number
    lastEvaluatedKey?: any
}

// Listar todos os itens de uma tabela
export async function listItems(tableName: string): Promise<ListItemsResponse> {
    const response = await api.get(`/table/${tableName}/items`)
    return {
        items: response.data.data || [],
        count: response.data.data?.length || 0
    }
}

// Buscar item específico
export async function getItem(tableName: string, itemId: string): Promise<TableItem> {
    const response = await api.get(`/table/${tableName}/item/${itemId}`)
    return response.data.data
}

// Criar novo item
export async function createItem(tableName: string, itemData: TableItem): Promise<TableItem> {
    const response = await api.post(`/table/${tableName}/item`, itemData)
    return response.data.data
}

// Atualizar item
export async function updateItem(tableName: string, itemId: string, itemData: TableItem): Promise<TableItem> {
    const response = await api.put(`/table/${tableName}/item/${itemId}`, itemData)
    return response.data.data
}

// Deletar item
export async function deleteItem(tableName: string, itemId: string): Promise<void> {
    await api.delete(`/table/${tableName}/item/${itemId}`)
}

// Exportar também como objeto para compatibilidade
export const tableItemService = {
    listItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
}
