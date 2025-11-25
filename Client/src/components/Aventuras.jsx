import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import GameSessionItem from "../components/GameSessionItem";

export default function Aventuras() {
  const [user, setUser] = useState(null);
  const [aventuras, setAventuras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Detecta usuario logueado
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

  // 🔹 Escucha y carga aventuras según el usuario
  useEffect(() => {
    if (!user) {
      setAventuras([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const q = query(
      collection(db, "game_sessions"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const items = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            const raw = d.sessionJson;
            let parsed = {};

            // 🔹 Convertir JSON string → Objeto
            if (raw) {
              try {
                parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              } catch (e) {
                console.error("Error parseando sessionJson:", e);
                parsed = {};
              }
            }

            // 🔹 Timestamp
            const ts = parsed.metadata?.lastUpdated || d.updatedAt || Date.now();
            const updatedAtDate =
              typeof ts === "number"
                ? new Date(ts)
                : ts?.toDate
                ? ts.toDate()
                : new Date();

            return {
              id: docSnap.id,
              titulo:
                parsed.metadata?.gameName ||
                d.gameName ||
                "Sin título",
              descripcion:
                parsed.metadata?.summary ||
                d.summary ||
                "Sin descripción",
              updatedAt: updatedAtDate,
            };
          });

          // 🔹 Ordernar por fecha
          items.sort((a, b) => b.updatedAt - a.updatedAt);

          setAventuras(items);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Error procesando partidas");
          setLoading(false);
        }
      },
      (err) => {
        console.error("onSnapshot error:", err);
        setError("Error leyendo partidas desde Firestore");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // 🔹 Eliminar aventura
  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta partida?")) return;
    try {
      await deleteDoc(doc(db, "game_sessions", id));
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("No se pudo eliminar la partida.");
    }
  };

  // 🔹 Abrir aventura (luego irá navegación)
  const handleAbrir = (item) => {
    console.log("👉 Abrir partida:", item.id);
    alert(`Abrir partida: ${item.titulo}`);
  };

  // 🔹 Interfaz
  if (loading) return <p>Cargando partidas...</p>;
  if (!user) return <p>Iniciá sesión para ver tus aventuras.</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="aventuras-container">
      <h2>Mis Aventuras</h2>

      {aventuras.length === 0 ? (
        <p>No tenés aventuras todavía 😔</p>
      ) : (
        aventuras.map((a) => (
          <GameSessionItem
            key={a.id}
            aventura={a}
            onClick={handleAbrir}
            onDelete={handleEliminar}
          />
        ))
      )}
    </div>
  );
}
