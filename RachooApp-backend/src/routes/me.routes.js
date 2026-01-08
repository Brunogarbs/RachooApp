import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { me } from "../controllers/me.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", me);

export default router;
