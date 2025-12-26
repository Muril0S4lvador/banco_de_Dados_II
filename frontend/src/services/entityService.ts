import api from '../lib/axios'

export interface EntityItem {
    [key: string]: any
}

export async function listEntity(path: string): Promise<EntityItem[]> {
    const response = await api.get(`/${path}`)
    return response.data?.data || []
}

export async function getEntity(path: string, itemId: string): Promise<EntityItem> {
    const response = await api.get(`/${path}/${encodeURIComponent(itemId)}`)
    return response.data?.data
}

export async function createEntity(path: string, data: EntityItem): Promise<EntityItem> {
    const response = await api.post(`/${path}`, data)
    return response.data?.data
}

export async function updateEntity(path: string, itemId: string, data: EntityItem): Promise<EntityItem> {
    const response = await api.put(`/${path}/${encodeURIComponent(itemId)}`, data)
    return response.data?.data
}

export async function deleteEntity(path: string, itemId: string): Promise<void> {
    await api.delete(`/${path}/${encodeURIComponent(itemId)}`)
}
