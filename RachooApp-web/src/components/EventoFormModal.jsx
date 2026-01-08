import { useEffect, useState } from "react";
import api from "../api/api";

export default function EventoFormModal({
  aberto,
  modo, // "create" | "edit"
  eventoId,
  onClose,
  onSuccess
}) {
  const [nome, setNome] = useState("");
  const [pessoas, setPessoas] = useState([]);
  const [pessoasTemp, setPessoasTemp] = useState([]);
  const [nomePessoa, setNomePessoa] = useState("");
  const [emailPessoa, setEmailPessoa] = useState("");
  const [pixTipoPessoa, setPixTipoPessoa] = useState("");
  const [pixChavePessoa, setPixChavePessoa] = useState("");
  const [pessoaEditando, setPessoaEditando] = useState(null);

  // Pegar userId do token
  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  // Estado para armazenar os dados do usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Reset do modal ao abrir
  useEffect(() => {
    if (!aberto) return;

    setNome("");
    setPessoas([]);
    setPessoasTemp([]);
    setNomePessoa("");
    setEmailPessoa("");
    setPessoaEditando(null);

    if (modo === "create") {
      carregarUsuarioLogado();
      return;
    }

    if (modo === "edit" && eventoId) {
      carregarEvento();
      carregarPessoas();
    }
  }, [aberto, modo, eventoId]);

  useEffect(() => {
    if (modo === "create" && usuarioLogado) {
      setPessoasTemp([
        {
          nome: usuarioLogado.nome,
          email: usuarioLogado.email,
          userId: usuarioLogado.id,
          criador: true
        }
      ]);
    }
  }, [modo, usuarioLogado]);

  async function carregarUsuarioLogado() {
    const { data } = await api.get("/me");
    setUsuarioLogado(data);
  }

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
    if (!nomePessoa || !emailPessoa || !pixTipoPessoa || !pixChavePessoa) {
      alert("Informe nome, email, tipo do PIX e chave PIX");
      return;
    }

    if (modo === "create") {
      setPessoasTemp(prev => [
        ...prev,
        {
          nome: nomePessoa,
          email: emailPessoa,
          pixTipo: pixTipoPessoa,
          pixChave: pixChavePessoa
        }
      ]);
    } else {
      api.post("/pessoas", {
        nome: nomePessoa,
        email: emailPessoa,
        pixTipo: pixTipoPessoa,
        pixChave: pixChavePessoa,
        eventoId
      }).then(carregarPessoas);
    }
    setNomePessoa("");
    setEmailPessoa("");
    setPixTipoPessoa("");
    setPixChavePessoa("");
  }

  async function salvar() {
    if (!nome) return;

    // CREATE
    if (modo === "create") {
      const { data } = await api.post("/eventos", { nome });

      for (const p of pessoasTemp) {
        await api.post("/pessoas", {
          nome: p.nome,
          email: p.email,
          pixTipo: p.pixTipo,
          pixChave: p.pixChave,
          eventoId: data.id,
          userId: p.userId || null
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

  async function removerPessoa(pessoaId) {
    if (!window.confirm("Remover esta pessoa do evento?")) return;
    await api.delete(`/pessoas/${pessoaId}`);
    carregarPessoas();
  }

  async function salvarPessoaEditada() {
    if (!pessoaEditando) return;

    await api.put(`/pessoas/${pessoaEditando.id}`, {
      nome: pessoaEditando.nome,
      email: pessoaEditando.email,
      pixTipo: pessoaEditando.pixTipo,
      pixChave: pessoaEditando.pixChave
    });

    setPessoaEditando(null);
    carregarPessoas();
  }

  function removerPessoaTemp(index) {
    setPessoasTemp(prev => prev.filter((_, i) => i !== index));
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
        />

        <h4>Pessoas</h4>

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

          <select
            value={pixTipoPessoa}
            onChange={e => setPixTipoPessoa(e.target.value)}
          >
            <option value="" disabled>
              Selecione o tipo do PIX
            </option>
            <option value="CPF">CPF</option>
            <option value="EMAIL">Email</option>
            <option value="TELEFONE">Telefone</option>
            <option value="CHAVE_ALEATORIA">Chave Aleatória</option>
          </select>


          <input
            placeholder="Chave PIX"
            value={pixChavePessoa}
            onChange={e => setPixChavePessoa(e.target.value)}
          />

          <button type="submit" disabled={!nomePessoa || !emailPessoa || !pixChavePessoa || !pixTipoPessoa}>
            Adicionar
          </button>
        </form>

        <ul>
          {(modo === "create" ? pessoasTemp : pessoas).map((p, i) => (
            <li key={p.id || i} style={{ marginBottom: 8 }}>
              {pessoaEditando && pessoaEditando.id === p.id ? (
                <>
                  <input
                    value={pessoaEditando.nome}
                    onChange={e =>
                      setPessoaEditando({ ...pessoaEditando, nome: e.target.value })
                    }
                  />

                  <input
                    value={pessoaEditando.email}
                    onChange={e =>
                      setPessoaEditando({ ...pessoaEditando, email: e.target.value })
                    }
                  />

                  <select
                    value={pessoaEditando.pixTipo || ""}
                    onChange={e =>
                      setPessoaEditando({ ...pessoaEditando, pixTipo: e.target.value })
                    }
                  >
                    <option value="">Tipo PIX</option>
                    <option value="CPF">CPF</option>
                    <option value="EMAIL">Email</option>
                    <option value="TELEFONE">Telefone</option>
                    <option value="CHAVE_ALEATORIA">Chave Aleatória</option>
                  </select>

                  <input
                    value={pessoaEditando.pixChave || ""}
                    onChange={e =>
                      setPessoaEditando({ ...pessoaEditando, pixChave: e.target.value })
                    }
                    placeholder="Chave PIX"
                  />

                  <button onClick={salvarPessoaEditada}>💾</button>
                  <button onClick={() => setPessoaEditando(null)}>❌</button>
                </>
              ) : (
                <>
                  <strong>{p.nome}</strong> ({p.email})
                  {p.pixChave && <span> — PIX: {p.pixChave}</span>}

                  {modo === "edit" ? (
                    <>
                      <button onClick={() => setPessoaEditando(p)}>✏️</button>
                      <button onClick={() => removerPessoa(p.id)}>🗑️</button>
                    </>
                  ) : (
                    <>
                      {p.criador ? (
                        <span style={{ marginLeft: 8, color: "#666" }}>(criador)</span>
                      ) : (
                        <button onClick={() => removerPessoaTemp(i)}>🗑️</button>
                      )}
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 12 }}>
          <button onClick={salvar}>
            {modo === "create" ? "Criar evento" : "Salvar alterações"}
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
  width: 420
};
