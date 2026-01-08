import { PrismaClient } from "@prisma/client";
import { calcularDivisaoFinal } from "./divisao.service.js";

const prisma = new PrismaClient();

export async function gerarDashboardEvento(eventoId) {
  // Pessoas
  const pessoas = await prisma.pessoa.findMany({
    where: { eventoId }
  });

  // Gastos
  const gastos = await prisma.gasto.findMany({
    where: { eventoId }
  });

  // Divisões
  const divisoes = await prisma.divisao.findMany({
    where: {
      gasto: { eventoId }
    },
    include: {
      pessoa: true,
      gasto: { include: { pagoPor: true } }
    }
  });

  // Totais
  const totalGasto = gastos.reduce((sum, g) => sum + g.valor, 0);

  const pessoasMap = {};

  // Gastos detalhados
  const gastosDetalhados = await prisma.gasto.findMany({
    where: { eventoId },
    include: {
      pagoPor: true,
      divisoes: {
        include: { pessoa: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });


  pessoas.forEach(p => {
    pessoasMap[p.id] = {
      id: p.id,
      nome: p.nome,
      pixTipo: p.pixTipo,
      pixChave: p.pixChave,
      pagou: 0,
      devia: 0,
      saldo: 0
    };
  });

  // Calcular pagou / devia
  for (const d of divisoes) {
    pessoasMap[d.pessoaId].devia += d.valor;
    pessoasMap[d.gasto.pagoPorId].pagou += d.valor;
  }

  // Saldo
  Object.values(pessoasMap).forEach(p => {
    p.saldo = Number((p.pagou - p.devia).toFixed(2));
    p.pagou = Number(p.pagou.toFixed(2));
    p.devia = Number(p.devia.toFixed(2));
  });

  // Acerto final
  const acertoFinal = await calcularDivisaoFinal(eventoId);

  return {
    resumo: {
      totalGasto: Number(totalGasto.toFixed(2)),
      totalPessoas: pessoas.length,
      totalGastos: gastos.length
    },
    pessoas: Object.values(pessoasMap),
    acertoFinal,
    gastos: gastosDetalhados
  };
}
