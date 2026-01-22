import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// Criar gasto
export async function createGasto(req, res) {
  const { descricao, valor, pagoPorId, eventoId, pessoasIds } = req.body;

  if (!descricao || !valor || !pagoPorId || !eventoId || !pessoasIds?.length) {
    return res.status(400).json({ error: "Dados obrigatórios ausentes" });
  }

  const evento = await prisma.evento.findFirst({
    where: { id: eventoId, userId: req.userId }
  });

  if (!evento) {
    return res.status(403).json({ error: "Evento inválido" });
  }

  // 🔥 GERA DIVISÕES CORRETAS
  const qtd = pessoasIds.length;
  const valorTotal = Number(valor);

  const valorBase = Math.floor((valorTotal / qtd) * 100) / 100;
  let totalDistribuido = 0;

  const divisoes = pessoasIds.map((pessoaId, index) => {
    let valorDivisao = valorBase;

    // última pessoa recebe ajuste de centavos
    if (index === qtd - 1) {
      valorDivisao = Number(
        (valorTotal - totalDistribuido).toFixed(2)
      );
    }

    totalDistribuido += valorDivisao;

    return {
      pessoaId,
      valor: valorDivisao
    };
  });

  // ✅ CRIA O GASTO + DIVISÕES
  const gasto = await prisma.gasto.create({
    data: {
      descricao,
      valor: valorTotal,
      pagoPorId,
      eventoId,
      divisoes: {
        create: divisoes
      }
    },
    include: {
      pagoPor: true,
      divisoes: {
        include: { pessoa: true }
      }
    }
  });

  // ✅ RESPONDE A REQUEST
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
