import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Criar evento
export async function createEvento(req, res) {
  const { nome } = req.body;

  const evento = await prisma.evento.create({
    data: {
      nome,
      user: {
        connect: { id: req.userId }
      }
    }
  });

  return res.status(201).json(evento);
}


// Listar eventos do usuário
export async function listEventos(req, res) {
  const eventos = await prisma.evento.findMany({
    where: {
      userId: req.userId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return res.json(eventos);
}

// Buscar evento por ID
export async function getEventoById(req, res) {
  const { id } = req.params;

  const evento = await prisma.evento.findFirst({
    where: {
      id,
      userId: req.userId
    }
  });

  if (!evento) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  return res.json(evento);
}

// Atualizar evento
export async function updateEvento(req, res) {
  const { id } = req.params;
  const { nome } = req.body;

  const evento = await prisma.evento.findFirst({
    where: {
      id,
      userId: req.userId
    }
  });

  if (!evento) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  const eventoAtualizado = await prisma.evento.update({
    where: { id },
    data: { nome }
  });

  return res.json(eventoAtualizado);
}

// Excluir evento
export async function deleteEvento(req, res) {
  const { id } = req.params;

  const evento = await prisma.evento.findFirst({
    where: {
      id,
      userId: req.userId
    }
  });

  if (!evento) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  await prisma.evento.delete({
    where: { id }
  });

  return res.status(200).json({
    message: "Evento excluído com sucesso"
  });
}
