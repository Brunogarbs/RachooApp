import { useEffect, useState } from "react";
import api from "../api/api";

export default function EventoFormModal({
  aberto,
  modo, // create | edit
  eventoId,
  onClose,
  onSuccess
}) {
  const podeEditar = modo === "create" || modo === "edit";

  const [nome, setNome] = useState("");
  const [pessoas, setPessoas] = useState([]);
  const [pessoasTemp, setPessoasTemp] = useState([]);
  const [nomePessoa, setNomePessoa] = useState("");
  const [emailPessoa, setEmailPessoa] = useState("");

  // RESET TOTAL AO ABRIR
  useEffect(() => {
    if (!aberto) return;

    setNome("");
    setPessoas([]);
    setPessoasTemp([]);
    setNomePessoa("");
    setEmailPessoa("");

    if (modo === "edit" && eventoId) {
      carregarEvento();
      carregarPessoas();
    }
  }, [aberto, modo, eventoId]);

  async function carregarEvento() {
    const { data } = await api.get(`/eventos/${eventoId}`);
    setNome(data.nome);
  }

  async function carregarPessoas() {
    const { data } = await api.get(`/pessoas/evento/${eventoId}`);
    setPessoas(data);
  }

  function adicionarPessoa(e) {
    e.preventDefault();

    if (modo === "create") {
      setPessoasTemp(prev => [...prev, { nome: nomePessoa, email: emailPessoa }]);
    } else {
      api.post("/pessoas", { nome: nomePessoa, email: emailPessoa, eventoId })
        .then(carregarPessoas);
    }

    setNomePessoa("");
    setEmailPessoa("");
  }

  async function salvar() {
    // CREATE
    if (modo === "create") {
      const { data } = await api.post("/eventos", { nome });

      for (const p of pessoasTemp) {
        await api.post("/pessoas", {
          nome: p.nome,
          email: p.email,
          eventoId: data.id
        });
      }

      onSuccess(data.id);
    }

    // EDIT
    if (modo === "edit") {
      await api.put(`/eventos/${eventoId}`, { nome });
      onSuccess(eventoId);
    }

    onClose();
  }

  if (!aberto) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>{modo === "create" ? "Criar Evento" : "Editar Evento"}</h2>

        <input
          placeholder="Nome do evento"
          value={nome}
          onChange={e => setNome(e.target.value)}
          disabled={!podeEditar}
        />

        <h4>Pessoas</h4>

        {podeEditar && (
          <form onSubmit={adicionarPessoa}>
            <input
              placeholder="Nome"
              value={nomePessoa}
              onChange={e => setNomePessoa(e.target.value)}
            />
            <input
              placeholder="Email"
              value={emailPessoa}
              onChange={e => setEmailPessoa(e.target.value)}
            />
            <button type="submit">Adicionar</button>
          </form>
        )}

        <ul>
          {(modo === "create" ? pessoasTemp : pessoas).map((p, i) => (
            <li key={i}>{p.nome} ({p.email})</li>
          ))}
        </ul>

        <div style={{ marginTop: 10 }}>
          <button onClick={salvar}>
            {modo === "create" ? "Criar" : "Salvar"}
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 400
};
