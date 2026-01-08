import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      nome: true,
      email: true
    }
  });

  return res.json(user);
}
