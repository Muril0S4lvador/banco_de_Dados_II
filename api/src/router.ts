import { Router, Request, Response } from "express";
import { AuthController } from "./controller/AuthController";
import { RoleController } from "./controller/RoleController";
import { TableController } from "./controller/TableController";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    res.send("API rodando!\n");
});

router.post("/login", new AuthController().login);
router.get("/me", new AuthController().returnUserInfo);

// Rotas de roles
router.post("/role", RoleController.createRole);
router.get("/role", RoleController.listRoles);
router.get("/role/:roleId", RoleController.getRole);
router.put("/role/:roleId", RoleController.updateRole);

// Rotas de tabelas
router.get("/tables", TableController.listTables);
router.get("/tables/names", TableController.listTableNames);

export default router;