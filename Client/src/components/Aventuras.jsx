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

export default function Aventuras() {
  const [user, setUser] = useState(null);
  const [aventuras, setAventuras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Esperar a que firebase informe el usuario (evita currentUser null)
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

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

            // sessionJson puede ser string o ya objeto
            let parsed = {};
            if (d.sessionJson) {
              try {
                parsed =
                  typeof d.sessionJson === "string"
                    ? JSON.parse(d.sessionJson)
                    : d.sessionJson;
              } catch (e) {
                // si parse falla, lo guardamos en summary crudo
                console.warn("Error parseando sessionJson:", e);
                parsed = { summary: "Contenido inválido", gameName: "Sin título" };
              }
            }

            // lastUpdated puede venir como número (ms), string, o dentro de parsed
            let updatedAtDate = null;
            const possible = d.updatedAt ?? parsed.lastUpdated ?? parsed.updatedAt;

            if (possible instanceof Object && possible.toDate) {
              // Si es Timestamp de Firestore
              updatedAtDate = possible.toDate();
            } else if (typeof possible === "number") {
              updatedAtDate = new Date(possible);
            } else if (typeof possible === "string") {
              const n = Number(possible);
              updatedAtDate = !Number.isNaN(n) ? new Date(n) : new Date(possible);
            } else {
              updatedAtDate = new Date(); // fallback: ahora
            }

            return {
              id: docSnap.id,
              titulo: parsed.gameName || d.gameName || "Sin título",
              descripcion: parsed.summary || d.summary || "",
              updatedAt: updatedAtDate,
              raw: d,
            };
          });

          // ordenar por fecha desc
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

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta partida? Esta acción no se puede deshacer.")) return;
    try {
      await deleteDoc(doc(db, "game_sessions", id));
    } catch (err) {
      console.error("Error eliminando partida:", err);
      alert("No se pudo eliminar la partida.");
    }
  };

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
          <div key={a.id} className="aventura-card" style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 6px 0" }}>{a.titulo}</h3>
                <p style={{ margin: 0 }}>{a.descripcion}</p>
                <small style={{ color: "#bbb" }}>
                  Actualizado: {a.updatedAt.toLocaleString()}
                </small>
              </div>

              <div>
                <button
                  onClick={() => handleEliminar(a.id)}
                  title="Eliminar"
                  style={deleteBtnStyle}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* estilos inline mínimos (sustituir por tu CSS/Tailwind) */
const cardStyle = {
  background: "rgba(0,0,0,0.45)",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.06)",
};

const deleteBtnStyle = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 18,
  color: "#ff6b6b",
};
