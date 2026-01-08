import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import eventoRoutes from "./routes/evento.routes.js";
import pessoaRoutes from "./routes/pessoa.routes.js";
import gastoRoutes from "./routes/gasto.routes.js";
import divisaoRoutes from "./routes/divisao.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import meRoutes from "./routes/me.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/eventos", eventoRoutes);
app.use("/pessoas", pessoaRoutes);
app.use("/gastos", gastoRoutes);
app.use("/divisoes", divisaoRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/me", meRoutes);


export default app;
