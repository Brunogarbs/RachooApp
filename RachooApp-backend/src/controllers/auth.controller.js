import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function register(req, res) {
  const { nome, email, senha } = req.body;

  const senhaHash = await bcrypt.hash(senha, 10);

  const user = await prisma.user.create({
    data: { nome, email, senha: senhaHash }
  });

  return res.json(user);
}

export async function login(req, res) {
  const { email, senha } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(senha, user.senha))) {
    return res.status(400).json({ error: "Email ou senha inválidos" });
  }

  await prisma.pessoa.updateMany({
    where: {
      email: user.email,
      userId: null
    },
    data: {
      userId: user.id
    }
  });

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email
    }
  });
}
