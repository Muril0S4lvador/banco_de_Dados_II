import { Router, Request, Response } from "express";
import { AuthController } from "./controller/AuthController";
import { RoleController } from "./controller/RoleController";
import { TableController } from "./controller/TableController";
import { UserController } from "./controller/UserController";
import { TableItemController } from "./controller/TableItemController";
import { BranchController } from "./controller/BranchController";
import { CustomerController } from "./controller/CustomerController";
import { AccountController } from "./controller/AccountController";
import { LoanController } from "./controller/LoanController";
import { BorrowerController } from "./controller/BorrowerController";
import { DepositorController } from "./controller/DepositorController";
import { TokenTableController } from "./controller/TokenTableController";
import { PermissionTableController } from "./controller/PermissionTableController";

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
router.delete("/role/:roleId", RoleController.deleteRole);

// Rotas de usuários
router.post("/user", UserController.createUser);
router.get("/user", UserController.listUsers);
router.get("/user/:userId", UserController.getUser);
router.put("/user/:userId", UserController.updateUser);
router.put("/user/:userId/password", UserController.changePassword);
router.delete("/user/:userId", UserController.deleteUser);

// Rotas de tabelas
router.get("/tables", TableController.listTables);
router.get("/tables/names", TableController.listTableNames);

// Rotas de itens das tabelas
router.get("/table/:tableName/items", TableItemController.listItems);
router.post("/table/:tableName/item", TableItemController.createItem);
router.get("/table/:tableName/item/:itemId", TableItemController.getItem);
router.put("/table/:tableName/item/:itemId", TableItemController.updateItem);
router.delete("/table/:tableName/item/:itemId", TableItemController.deleteItem);

// branch
router.get("/branch", BranchController.list);
router.get("/branch/:itemId", BranchController.get);
router.post("/branch", BranchController.create);
router.put("/branch/:itemId", BranchController.update);
router.delete("/branch/:itemId", BranchController.delete);

// customer
router.get("/customer", CustomerController.list);
router.get("/customer/:itemId", CustomerController.get);
router.post("/customer", CustomerController.create);
router.put("/customer/:itemId", CustomerController.update);
router.delete("/customer/:itemId", CustomerController.delete);

// account
router.get("/account", AccountController.list);
router.get("/account/:itemId", AccountController.get);
router.post("/account", AccountController.create);
router.put("/account/:itemId", AccountController.update);
router.delete("/account/:itemId", AccountController.delete);

// loan
router.get("/loan", LoanController.list);
router.get("/loan/:itemId", LoanController.get);
router.post("/loan", LoanController.create);
router.put("/loan/:itemId", LoanController.update);
router.delete("/loan/:itemId", LoanController.delete);

// borrower (itemId = id gerado pelo backend)
router.get("/borrower", BorrowerController.list);
router.get("/borrower/:itemId", BorrowerController.get);
router.post("/borrower", BorrowerController.create);
router.put("/borrower/:itemId", BorrowerController.update);
router.delete("/borrower/:itemId", BorrowerController.delete);

// depositor (itemId = customer_name::account_number)
router.get("/depositor", DepositorController.list);
router.get("/depositor/:itemId", DepositorController.get);
router.post("/depositor", DepositorController.create);
router.put("/depositor/:itemId", DepositorController.update);
router.delete("/depositor/:itemId", DepositorController.delete);

// tokens
router.get("/token", TokenTableController.list);
router.get("/token/:itemId", TokenTableController.get);
router.post("/token", TokenTableController.create);
router.put("/token/:itemId", TokenTableController.update);
router.delete("/token/:itemId", TokenTableController.delete);

// permissions
router.get("/permission", PermissionTableController.list);
router.get("/permission/:itemId", PermissionTableController.get);
router.post("/permission", PermissionTableController.create);
router.put("/permission/:itemId", PermissionTableController.update);
router.delete("/permission/:itemId", PermissionTableController.delete);

export default router;