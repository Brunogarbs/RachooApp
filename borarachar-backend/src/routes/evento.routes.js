import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createEvento,
  listEventos,
  getEventoById,
  updateEvento,
  deleteEvento
} from "../controllers/evento.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createEvento);
router.get("/", listEventos);
router.get("/:id", getEventoById);
router.put("/:id", updateEvento);
router.delete("/:id", deleteEvento);

export default router;
