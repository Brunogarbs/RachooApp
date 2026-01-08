import { useEffect, useState } from "react";
import api from "../api/api";

export default function Pessoas() {
  const eventoId = localStorage.getItem("eventoId");
  const [pessoas, setPessoas] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  async function carregarPessoas() {
    const { data } = await api.get(`/pessoas/evento/${eventoId}`);
    setPessoas(data);
  }

  async function adicionarPessoa(e) {
    e.preventDefault();

    await api.post("/pessoas", {
      nome,
      email,
      eventoId
    });

    setNome("");
    setEmail("");
    carregarPessoas();
  }

  useEffect(() => {
    carregarPessoas();
  }, []);

  return (
    <div>
      <h2>Pessoas do Evento</h2>

      <form onSubmit={adicionarPessoa}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit">Adicionar</button>
      </form>

      <ul>
        {pessoas.map(p => (
          <li key={p.id}>
            {p.nome} ({p.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
