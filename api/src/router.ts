import { Router, Request, Response } from "express";
import { AuthController } from "./controller/AuthController";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    res.send("API rodando!\n");
});

router.post("/login", new AuthController().login);
router.get("/me", new AuthController().returnUserInfo);

export default router;