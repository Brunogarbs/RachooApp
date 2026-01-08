import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { dashboardEvento } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/evento/:eventoId", dashboardEvento);

export default router;
