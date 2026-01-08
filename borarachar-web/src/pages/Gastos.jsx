import { useEffect, useState } from "react";
import api from "../api/api";

export default function Gastos() {
  const eventoId = localStorage.getItem("eventoId");

  const [pessoas, setPessoas] = useState([]);
  const [gastos, setGastos] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [pagoPorId, setPagoPorId] = useState("");
  const [pessoasIds, setPessoasIds] = useState([]);

  async function carregarDados() {
    const pessoasRes = await api.get(`/pessoas/evento/${eventoId}`);
    const gastosRes = await api.get(`/gastos/evento/${eventoId}`);

    setPessoas(pessoasRes.data);
    setGastos(gastosRes.data);
  }

  async function criarGasto(e) {
    e.preventDefault();

    if (!descricao || !valor || !pagoPorId || pessoasIds.length === 0) {
      alert("Preencha todos os campos");
      return;
    }

    await api.post("/gastos", {
      descricao,
      valor: Number(valor),
      pagoPorId,
      eventoId,
      pessoasIds
    });

    setDescricao("");
    setValor("");
    setPagoPorId("");
    setPessoasIds([]);

    carregarDados();
  }

  async function excluirGasto(id) {
    if (!window.confirm("Excluir este gasto?")) return;

    await api.delete(`/gastos/${id}`);
    carregarDados();
  }

  function togglePessoa(id) {
    setPessoasIds(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div>
      <h1>Gastos do Evento</h1>

      {/* FORMULÁRIO */}
      <form onSubmit={criarGasto}>
        <input
          placeholder="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={e => setValor(e.target.value)}
        />

        <select
          value={pagoPorId}
          onChange={e => setPagoPorId(e.target.value)}
        >
          <option value="">Quem pagou?</option>
          {pessoas.map(p => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <p>Dividir entre:</p>
        {pessoas.map(p => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={pessoasIds.includes(p.id)}
              onChange={() => togglePessoa(p.id)}
            />
            {p.nome}
          </label>
        ))}

        <button type="submit">Adicionar gasto</button>
      </form>

      <hr />

      {/* LISTA DE GASTOS */}
      <ul>
        {gastos.map(g => (
          <li key={g.id}>
            <strong>{g.descricao}</strong> — R$ {g.valor.toFixed(2)}  
            <br />
            Pago por: {g.pagoPor.nome}
            <br />
            <button onClick={() => excluirGasto(g.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
