import { Router, Request, Response } from "express";
import { AuthController } from "./controller/AuthController";
import { RoleController } from "./controller/RoleController";
import { TableController } from "./controller/TableController";
import { UserController } from "./controller/UserController";
import { UserPermissionsController } from "./controller/UserPermissionsController";
import { TableItemController } from "./controller/TableItemController";
import { BranchController } from "./controller/BranchController";
import { CustomerController } from "./controller/CustomerController";
import { AccountController } from "./controller/AccountController";
import { LoanController } from "./controller/LoanController";
import { BorrowerController } from "./controller/BorrowerController";
import { DepositorController } from "./controller/DepositorController";
import { TokenTableController } from "./controller/TokenTableController";
import { AuthMiddleware } from "./middleware/AuthMiddleware";
import { PermissionMiddleware } from "./middleware/PermissionMiddleware";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    res.send("API rodando!\n");
});

router.post("/login", new AuthController().login);
router.get("/me", new AuthController().returnUserInfo);

// Rotas de permissões do usuário
router.get("/user/permissions", AuthMiddleware.authenticate, UserPermissionsController.getMyPermissions);

// Rotas de roles
router.post("/role", AuthMiddleware.authenticate, RoleController.createRole);
router.get("/role", AuthMiddleware.authenticate, RoleController.listRoles);
router.get("/role/:roleId", AuthMiddleware.authenticate, RoleController.getRole);
router.put("/role/:roleId", AuthMiddleware.authenticate, RoleController.updateRole);
router.delete("/role/:roleId", AuthMiddleware.authenticate, RoleController.deleteRole);

// Rotas de usuários
router.post("/user", AuthMiddleware.authenticate, UserController.createUser);
router.get("/user", AuthMiddleware.authenticate, UserController.listUsers);
router.get("/user/:userId", AuthMiddleware.authenticate, UserController.getUser);
router.put("/user/:userId", AuthMiddleware.authenticate, UserController.updateUser);
router.put("/user/:userId/password", AuthMiddleware.authenticate, UserController.changePassword);
router.delete("/user/:userId", AuthMiddleware.authenticate, UserController.deleteUser);

// Rotas de tabelas
router.get("/tables", AuthMiddleware.authenticate, TableController.listTables);
router.get("/tables/names", AuthMiddleware.authenticate, TableController.listTableNames);

// Rotas de itens das tabelas
router.get("/table/:tableName/items", AuthMiddleware.authenticate, TableItemController.listItems);
router.post("/table/:tableName/item", AuthMiddleware.authenticate, TableItemController.createItem);
router.get("/table/:tableName/item/:itemId", AuthMiddleware.authenticate, TableItemController.getItem);
router.put("/table/:tableName/item/:itemId", AuthMiddleware.authenticate, TableItemController.updateItem);
router.delete("/table/:tableName/item/:itemId", AuthMiddleware.authenticate, TableItemController.deleteItem);

// branch
router.get("/branch", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('branch', 'view'), BranchController.list);
router.get("/branch/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('branch', 'view'), BranchController.get);
router.post("/branch", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('branch', 'edit'), BranchController.create);
router.put("/branch/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('branch', 'edit'), BranchController.update);
router.delete("/branch/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('branch', 'delete'), BranchController.delete);

// customer
router.get("/customer", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('customer', 'view'), CustomerController.list);
router.get("/customer/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('customer', 'view'), CustomerController.get);
router.post("/customer", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('customer', 'edit'), CustomerController.create);
router.put("/customer/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('customer', 'edit'), CustomerController.update);
router.delete("/customer/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('customer', 'delete'), CustomerController.delete);

// account
router.get("/account", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('account', 'view'), AccountController.list);
router.get("/account/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('account', 'view'), AccountController.get);
router.post("/account", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('account', 'edit'), AccountController.create);
router.put("/account/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('account', 'edit'), AccountController.update);
router.delete("/account/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('account', 'delete'), AccountController.delete);

// loan
router.get("/loan", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('loan', 'view'), LoanController.list);
router.get("/loan/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('loan', 'view'), LoanController.get);
router.post("/loan", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('loan', 'edit'), LoanController.create);
router.put("/loan/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('loan', 'edit'), LoanController.update);
router.delete("/loan/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('loan', 'delete'), LoanController.delete);

// borrower (itemId = id gerado pelo backend)
router.get("/borrower", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('borrower', 'view'), BorrowerController.list);
router.get("/borrower/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('borrower', 'view'), BorrowerController.get);
router.post("/borrower", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('borrower', 'edit'), BorrowerController.create);
router.put("/borrower/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('borrower', 'edit'), BorrowerController.update);
router.delete("/borrower/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('borrower', 'delete'), BorrowerController.delete);

// depositor (itemId = customer_name::account_number)
router.get("/depositor", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('depositor', 'view'), DepositorController.list);
router.get("/depositor/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('depositor', 'view'), DepositorController.get);
router.post("/depositor", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('depositor', 'edit'), DepositorController.create);
router.put("/depositor/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('depositor', 'edit'), DepositorController.update);
router.delete("/depositor/:itemId", AuthMiddleware.authenticate, PermissionMiddleware.checkPermission('depositor', 'delete'), DepositorController.delete);

// tokens
router.get("/token", AuthMiddleware.authenticate, TokenTableController.list);
router.get("/token/:itemId", AuthMiddleware.authenticate, TokenTableController.get);
router.post("/token", AuthMiddleware.authenticate, TokenTableController.create);
router.put("/token/:itemId", AuthMiddleware.authenticate, TokenTableController.update);
router.delete("/token/:itemId", AuthMiddleware.authenticate, TokenTableController.delete);

export default router;