import { useEffect, useState } from "react";
import api from "../api/api";
import AccordionItem from "../components/AccordionItem";

export default function EventoDashboard() {
  // Pegando o ID do evento
  const eventoId = localStorage.getItem("eventoId");
  const [data, setData] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);

  // Novos gastos
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [pagoPorId, setPagoPorId] = useState("");
  const [pessoasIds, setPessoasIds] = useState([]);

  async function carregarDashboard() {
    const { data } = await api.get(`/dashboard/evento/${eventoId}`);
    setData(data);
  }

  function togglePessoa(id) {
    setPessoasIds(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  }

  async function criarGasto(e) {
  e.preventDefault();

  if (!descricao || !valor || !pagoPorId || pessoasIds.length === 0) {
    alert("Preencha todos os campos");
    return;
  }

  try {
    await api.post("/gastos", {
      descricao,
      valor: Number(valor),
      pagoPorId,
      eventoId,
      pessoasIds
    });

    // limpa form
    setDescricao("");
    setValor("");
    setPagoPorId("");
    setPessoasIds([]);
    setMostrarModal(false);

    carregarDashboard();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar gasto");
  }
}


  function agruparPorRecebedor(acertoFinal) {
    const agrupado = {};

    for (const item of acertoFinal) {
      const recebedorId = item.para.id;

      if (!agrupado[recebedorId]) {
        agrupado[recebedorId] = {
          recebedor: item.para,
          total: 0,
          devedores: []
        };
      }

      agrupado[recebedorId].total += item.valor;

      agrupado[recebedorId].devedores.push({
        nome: item.de.nome,
        valor: item.valor
      });
    }

    return Object.values(agrupado);
  }


  function copiarPix(pix) {
    navigator.clipboard.writeText(pix);
    alert("PIX copiado!");
  }



  useEffect(() => {
    carregarDashboard();
  }, [eventoId]);

  if (!data) return <p>Carregando evento...</p>;

  const acertoFinal = data.acertoFinal || [];
  
  const acertoAgrupado = agruparPorRecebedor(acertoFinal);



  return (
    <div>
      <h1>Resumo do Evento</h1>

      {/* RESUMO */}
      <div>
        <p>Total gasto: R$ {data.resumo.totalGasto}</p>
        <p>Pessoas: {data.resumo.totalPessoas}</p>
      </div>
      <hr />
      {/* NOVO GASTO */}
      <button onClick={() => setMostrarModal(true)}>
        ➕ Adicionar gasto
      </button>

      <hr />
      <h2>Histórico de Gastos</h2>

      {(!data.gastos || data.gastos.length === 0) && (
        <p>Nenhum gasto registrado.</p>
      )}

      {(data.gastos || []).map(gasto => (
        <AccordionItem
          key={gasto.id}
          title={`${gasto.descricao} — R$ ${gasto.valor.toFixed(2)}`}
        >
          <p><strong>Pago por:</strong> {gasto.pagoPor.nome}</p>

          <p><strong>Dividido entre:</strong></p>
          <ul>
            {gasto.divisoes.map(d => (
              <li key={d.id}>
                {d.pessoa.nome} → R$ {d.valor.toFixed(2)}
              </li>
            ))}
          </ul>
        </AccordionItem>
      ))}
      <hr />

      {/* PESSOAS */}
      <h2>Pessoas</h2>
      <ul>
        {data.pessoas.map(p => (
          <li key={p.id}>
            <strong>{p.nome}</strong> <br />
            Pagou: R$ {p.pagou} <br />
            Devia: R$ {p.devia} <br />
            Saldo:{" "}
            <strong style={{ color: p.saldo < 0 ? "red" : "green" }}>
              {p.saldo}
            </strong>
          </li>
        ))}
      </ul>

      <hr />

      {/* ACERTO FINAL */}
      <h2>Acerto Final</h2>

      {acertoAgrupado.length === 0 && (
        <p>Todos estão com as contas em dia 🎉</p>
      )}

      <ul>
        {acertoAgrupado.map((agrupado, index) => (
          <li key={index} style={{ marginBottom: 12 }}>
            <strong>{agrupado.recebedor.nome}</strong> recebe{" "}
            <strong>R$ {agrupado.total.toFixed(2)}</strong>
            <br />
            <ul>
              {agrupado.devedores.map((dev, i) => (
                <li key={i}>
                  {dev.nome} → R$ {dev.valor.toFixed(2)}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 4 }}>
              {agrupado.recebedor.pixChave ? (
                <>
                  <span>
                    PIX ({agrupado.recebedor.pixTipo}): {agrupado.recebedor.pixChave}
                  </span>

                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => copiarPix(agrupado.recebedor.pixChave)}
                  >
                    📋 Copiar PIX
                  </button>
                </>
              ) : (
                <span style={{ color: "red" }}>
                  Pessoa sem PIX cadastrado
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      

      {mostrarModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>Novo Gasto</h2>

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
                {data.pessoas.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              <p>Dividir entre:</p>
              {data.pessoas.map(p => (
                <label key={p.id} style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={pessoasIds.includes(p.id)}
                    onChange={() => togglePessoa(p.id)}
                  />
                  {p.nome}
                </label>
              ))}

              <div style={{ marginTop: 10 }}>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 320
};
