import { gerarDashboardEvento } from "../services/dashboard.service.js";

export async function dashboardEvento(req, res) {
  const { eventoId } = req.params;

  const dashboard = await gerarDashboardEvento(eventoId);

  return res.json(dashboard);
}
