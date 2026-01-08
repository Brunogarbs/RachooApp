import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createGasto,
  listGastos,
  deleteGasto
} from "../controllers/gasto.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createGasto);
router.get("/evento/:eventoId", listGastos);
router.delete("/:id", deleteGasto);

export default router;
