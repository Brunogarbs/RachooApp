import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Criar pessoa
export async function createPessoa(req, res) {
  const { nome, email, pixTipo, pixChave, eventoId } = req.body;

  if (!nome || !email || !eventoId) {
    return res.status(400).json({ error: "Nome, email e evento são obrigatórios" });
  }

  // Verifica se o evento pertence ao usuário
  const evento = await prisma.evento.findFirst({
    where: { id: eventoId, userId: req.userId }
  });

  if (!evento) {
    return res.status(403).json({ error: "Evento inválido" });
  }

  // Verifica se existe usuário com esse email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  const jaExiste = await prisma.pessoa.findFirst({
    where: {
      eventoId,
      email
    }
  });

  if (jaExiste) {
    return res.status(400).json({
      error: "Já existe uma pessoa com este email no evento"
    });
  }


  const pessoa = await prisma.pessoa.create({
    data: {
      nome,
      email,
      pixTipo,
      pixChave,
      eventoId,
      userId: user?.id || null
    }
  });

  return res.status(201).json(pessoa);
}

// Listar pessoas do evento
export async function listPessoas(req, res) {
  const { eventoId } = req.params;

  const pessoas = await prisma.pessoa.findMany({
    where: { eventoId }
  });

  return res.json(pessoas);
}

// Deletar pessoa
export async function deletePessoa(req, res) {
  const { id } = req.params;

  const pessoa = await prisma.pessoa.findUnique({
    where: { id }
  });

  if (pessoa.userId === req.userId) {
    return res.status(400).json({ error: "Não é possível remover o criador do evento" });
  }
  await prisma.pessoa.delete({
    where: { id }
  });

  return res.status(204).send();
}

// Atualizar pessoa
export async function updatePessoa(req, res) {
  const { id } = req.params;
  const { nome, email, pixTipo, pixChave } = req.body;

  const pessoa = await prisma.pessoa.findUnique({ where: { id } });

  if (!pessoa) {
    return res.status(404).json({ error: "Pessoa não encontrada" });
  }

  // Não permitir alterar o vínculo do criador
  if (pessoa.userId === req.userId && email !== pessoa.email) {
    return res.status(400).json({
      error: "Não é possível alterar o email do criador do evento"
    });
  }

  const jaExiste = await prisma.pessoa.findFirst({
    where: {
      eventoId: pessoa.eventoId,
      email,
      NOT: { id }
    }
  });

  if (jaExiste) {
    return res.status(400).json({
      error: "Já existe uma pessoa com este email no evento"
    });
  }


  const pessoaAtualizada = await prisma.pessoa.update({
    where: { id },
    data: {
      nome,
      email,
      pixTipo,
      pixChave
    }
  });

  return res.json(pessoaAtualizada);
}

// Atualizar PIX
export async function updatePix(req, res) {
  const { id } = req.params;
  const { pixTipo, pixChave } = req.body;

  const pessoa = await prisma.pessoa.update({
    where: { id },
    data: { pixTipo, pixChave }
  });

  return res.json(pessoa);
}

