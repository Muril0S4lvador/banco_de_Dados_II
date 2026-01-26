import { Response } from "express";

export class RouteResponse {
    /**
     * Resposta da requisição caso tenha sido concluída com sucesso
     * @param res Variável Response do express
     * @param content Conteúdo a ser retornado
     * @param message Mensagem opcional de sucesso
     * @param statusCode Status code opcional (padrão 200)
     * @returns Resposta da requisição
     */
    public static success(res: Response, content: any, message?: string, statusCode: number = 200) {
        const response: any = { success: true, data: content };
        if (message) {
            response.message = message;
        }
        return res.status(statusCode).json(response);
    }

    /**
     * Resposta da requisição de criação de algum objeto caso tenha sido concluída com sucesso
     * @param res Variável Response do express
     * @param content Conteúdo a ser retornado
     * @returns Resposta da requisição
     */
    public static successCreated(res: Response, content: any) {
        return res.status(201).json({ success: true, data: content });
    }

    /**
     * Resposta da requisição caso tenha sido concluída com sucesso, mas sem nenhum objeto retornado
     * @param res Variável Response do express
     * @returns Resposta da requisição
     */
    public static successEmpty(res: Response) {
        return res.status(204).json({ success: true });
    }

    /**
     * Resposta da requisição caso tenha sido concluída com um erro genérico
     * @param res Variável Response do express
     * @param message Mensagem a ser retornada, por padrão a mensagem é 'Bad Request'
     * @param statusCode Status code opcional (padrão 400)
     * @returns Resposta da requisição
     */
    public static error(res: Response, message?: string, statusCode: number = 400) {
        return res.status(statusCode).json({ success: false, message: message || "Bad Request" });
    }

    /**
     * Resposta da requisição caso tenha sido concluída com um erro de servidor
     * @param res Variável Response do express
     * @param message Mensagem a ser retornada, por padrão a mensagem é 'Server Error'
     * @returns Resposta da requisição
     */
    public static serverError(res: Response, message?: string) {
        return res.status(500).json({ message: message || "Server Error" });
    }

    /**
     * Resposta da requisição caso tenha sido concluída com um erro de não encontrado
     * @param res Variável Response do express
     * @param message Mensagem a ser retornada, por padrão a mensagem é 'Entity not found'
     * @returns Resposta da requisição
     */
    public static notFound(res: Response, message?: string) {
        return res.status(404).json({ message: message || "Entity not found" });
    }

    /**
     * Resposta da requisição caso tenha sido concluída com um erro de autorização
     * @param res Variável Response do express
     * @param message Mensagem a ser retornada, por padrão a mensagem é 'Unauthorized Access'
     * @returns Resposta da requisição
     */
    public static unauthorizedError(res: Response, message?: string) {
        return res.status(401).json({ message: message || "Unauthorized Access" });
    }
}