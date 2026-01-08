import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Criar gasto
export async function createGasto(req, res) {
  const { descricao, valor, pagoPorId, eventoId, pessoasIds } = req.body;

  if (!descricao || !valor || !pagoPorId || !eventoId || !pessoasIds?.length) {
    return res.status(400).json({ error: "Dados obrigatórios ausentes" });
  }

  // Verifica se o evento pertence ao usuário
  const evento = await prisma.evento.findFirst({
    where: { id: eventoId, userId: req.userId }
  });

  if (!evento) {
    return res.status(403).json({ error: "Evento inválido" });
  }

  const valorPorPessoa = Number((valor / pessoasIds.length).toFixed(2));

  const gasto = await prisma.gasto.create({
    data: {
      descricao,
      valor,
      pagoPorId,
      eventoId,
      divisoes: {
        create: pessoasIds.map(pessoaId => ({
          pessoaId,
          valor: valorPorPessoa
        }))
      }
    },
    include: {
      divisoes: true
    }
  });

  return res.status(201).json(gasto);
}

// Listar gastos do evento
export async function listGastos(req, res) {
  const { eventoId } = req.params;

  const gastos = await prisma.gasto.findMany({
    where: { eventoId },
    include: {
      pagoPor: true,
      divisoes: {
        include: { pessoa: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json(gastos);
}

// Excluir gasto
export async function deleteGasto(req, res) {
  const { id } = req.params;

  await prisma.divisao.deleteMany({
    where: { gastoId: id }
  });

  await prisma.gasto.delete({
    where: { id }
  });

  return res.status(204).send();
}
