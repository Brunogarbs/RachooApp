import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // 👇 BLOQUEIA ACESSO AO LOGIN SE JÁ ESTIVER LOGADO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/eventos");
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await login(email, senha);
      navigate("/eventos");
    } catch {
      alert("Email ou senha inválidos");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>BoráRachar</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
      />

      <button type="submit">Entrar</button>
    </form>
  );
}
