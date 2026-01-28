import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function calcularDivisaoFinal(eventoId) {
  // 1️⃣ Buscar todas as pessoas do evento
  const pessoas = await prisma.pessoa.findMany({
    where: { eventoId }
  });

  // 2️⃣ Buscar todas as divisões do evento
  const divisoes = await prisma.divisao.findMany({
    where: {
      gasto: {
        eventoId
      }
    },
    include: {
      pessoa: true,
      gasto: {
        include: { pagoPor: true }
      }
    }
  });

  // 3️⃣ Mapear saldos
  const saldoMap = {};

  pessoas.forEach(p => {
    saldoMap[p.id] = {
      pessoa: p,
      saldo: 0
    };
  });

  // 4️⃣ Calcular saldos
  for (const d of divisoes) {
    saldoMap[d.pessoaId].saldo -= d.valor;
  }

  // 4.2 Quem pagou (valor REAL do gasto)
  const gastos = await prisma.gasto.findMany({
    where: { eventoId }
  });

  for (const gasto of gastos) {
    saldoMap[gasto.pagoPorId].saldo += gasto.valor;
  }

  // 5️⃣ Separar quem deve e quem recebe
  const devedores = [];
  const credores = [];

  Object.values(saldoMap).forEach(item => {
    if (item.saldo < 0) devedores.push(item);
    if (item.saldo > 0) credores.push(item);
  });

  // 6️⃣ Gerar transferências
  const transferencias = [];

  for (const credor of credores) {
    let saldoCredor = credor.saldo;

    for (const devedor of devedores) {
      if (saldoCredor <= 0) break;
      if (devedor.saldo >= 0) continue;

      const valor = Math.min(
        saldoCredor,
        Math.abs(devedor.saldo)
      );

      transferencias.push({
        de: {
          nome: devedor.pessoa.nome,
          pixTipo: devedor.pessoa.pixTipo,
          pixChave: devedor.pessoa.pixChave
        },
        para: {
          nome: credor.pessoa.nome,
          pixTipo: credor.pessoa.pixTipo,
          pixChave: credor.pessoa.pixChave
        },
        valor: Number(valor.toFixed(2))
      });

      saldoCredor -= valor;
      devedor.saldo += valor;
    }
  }
  return transferencias;
}
