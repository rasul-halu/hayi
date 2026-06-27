import { useNavigate }
from "react-router-dom";

import { useUser }
from "../../context/UserContext";

export default function HeartsEmpty() {

  const navigate =
    useNavigate();

  const { resetHearts } =
    useUser();

  const handleResetHearts = () => {
    resetHearts();
    navigate("/home");
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
      }}
    >

      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "#5A5A5A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          marginBottom: 24
        }}
      >
        💔
      </div>

      <h1>
        Сердца закончились
      </h1>

      <p
        style={{
          marginTop: 12,
          color: "#D9D9D9"
        }}
      >
        Ошибки расходуют сердца. Восстанови их,
        чтобы продолжить уроки.
      </p>

      <button
        onClick={handleResetHearts}
        style={{
          width: "100%",
          maxWidth: 320,
          marginTop: 28,
          padding: 18,
          background: "#58CC02",
          border: "none",
          borderRadius: 18,
          color: "#fff",
          fontWeight: "bold"
        }}
      >
        Восстановить сердца
      </button>

      <button
        onClick={() => navigate("/home")}
        style={{
          width: "100%",
          maxWidth: 320,
          marginTop: 12,
          padding: 18,
          background: "#5A5A5A",
          border: "none",
          borderRadius: 18,
          color: "#fff",
          fontWeight: "bold"
        }}
      >
        На главную
      </button>

    </div>
  );
}
