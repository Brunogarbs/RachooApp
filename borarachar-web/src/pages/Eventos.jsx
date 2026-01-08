import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import EventoFormModal from "../components/EventoFormModal";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState("create");
  const [eventoEditId, setEventoEditId] = useState(null);

  const navigate = useNavigate();

  async function carregarEventos() {
    const { data } = await api.get("/eventos");
    setEventos(data);
  }

  function abrirCriar() {
    setModoModal("create");
    setEventoEditId(null);
    setModalAberto(true);
  }

  function abrirEditar(id) {
    setModoModal("edit");
    setEventoEditId(id);
    setModalAberto(true);
  }

  function entrarEvento(id) {
    localStorage.setItem("eventoId", id);
    navigate("/evento");
  }

  async function excluirEvento(id) {
    if (!window.confirm("Excluir evento?")) return;
    await api.delete(`/eventos/${id}`);
    carregarEventos();
  }

  useEffect(() => {
    carregarEventos();
  }, []);

  return (
    <div>
      <h1>Meus Eventos</h1>

      <button onClick={abrirCriar}>Criar evento</button>

      <ul>
        {eventos.map(ev => (
          <li key={ev.id}>
            <strong>{ev.nome}</strong>

            <button onClick={() => entrarEvento(ev.id)}>
              Entrar
            </button>

            <button onClick={() => abrirEditar(ev.id)}>
              Editar
            </button>

            <button onClick={() => excluirEvento(ev.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>

      <EventoFormModal
        aberto={modalAberto}
        modo={modoModal}
        eventoId={eventoEditId}
        onClose={() => setModalAberto(false)}
        onSuccess={(id) => {
          carregarEventos();
          localStorage.setItem("eventoId", id);
        }}
      />
    </div>
  );
}
