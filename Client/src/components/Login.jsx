import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config"; // Asegúrate de importar auth
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Verifica si el usuario ya está autenticado al cargar el componente
  useEffect(() => {
    if (auth.currentUser) {
      console.log("Usuario ya autenticado:", auth.currentUser);
      navigate("/aventuras"); // Redirige a aventuras si ya hay un usuario autenticado
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar posibles errores

    try {
      // Intentar iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Usuario autenticado:", user); // Verificar el objeto de usuario

      if (user) {
        alert("Inicio de sesión exitoso 🎉");
        navigate("/aventuras"); // Redirigir a aventuras después de login exitoso
      }
    } catch (err) {
      setError("Email o contraseña incorrectos");
      console.error("Error de login:", err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Iniciar Sesión</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Ingresar</button>
    </form>
  );
}
