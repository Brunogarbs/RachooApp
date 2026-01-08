import { calcularDivisaoFinal } from "../services/divisao.service.js";

export async function resumoEvento(req, res) {
  const { eventoId } = req.params;

  const resultado = await calcularDivisaoFinal(eventoId);

  return res.json(resultado);
}
