// components/GameSessionItem.jsx
export default function GameSessionItem({ aventura, onClick, onDelete }) {
  return (
    <div
      className="aventura-card"
      style={cardStyle}
      onClick={() => onClick(aventura)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 6px 0" }}>{aventura.titulo}</h3>
          <p style={{ margin: 0 }}>{aventura.descripcion}</p>
          <small style={{ color: "#bbb" }}>
            Actualizado: {aventura.updatedAt.toLocaleString()}
          </small>
        </div>

        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(aventura.id);
            }}
            title="Eliminar"
            style={deleteBtnStyle}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "rgba(0,0,0,0.45)",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.06)",
  cursor: "pointer",
};

const deleteBtnStyle = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 18,
  color: "#ff6b6b",
};
