import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPessoa,
  listPessoas,
  updatePix,
  updatePessoa,
  deletePessoa
} from "../controllers/pessoa.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createPessoa);
router.get("/evento/:eventoId", listPessoas);
router.put("/:id/pix", updatePix);
router.put("/:id", authMiddleware, updatePessoa);
router.delete("/:id", authMiddleware, deletePessoa);

export default router;
