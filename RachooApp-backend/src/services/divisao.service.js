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
    // quem devia
    saldoMap[d.pessoaId].saldo -= d.valor;

    // quem pagou
    saldoMap[d.gasto.pagoPorId].saldo += d.valor;
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

  let i = 0, j = 0;

  while (i < devedores.length && j < credores.length) {
    const devedor = devedores[i];
    const credor = credores[j];

    const valor = Math.min(
      Math.abs(devedor.saldo),
      credor.saldo
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

    devedor.saldo += valor;
    credor.saldo -= valor;

    if (devedor.saldo === 0) i++;
    if (credor.saldo === 0) j++;
  }

  return transferencias;
}
