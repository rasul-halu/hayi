import { useNavigate } from "react-router-dom";

export default function Onboarding3() {

  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div />

      <div>

        <div
          style={{
            height: 220
          }}
        >
          onboarding-3.png
        </div>

        <h1>
          Начните уже сегодня
        </h1>

        <p>
          Всего 10 минут в день —
          и вы сможете говорить
          на лезгинском.
        </p>

      </div>

      <button
        onClick={() => navigate("/login")}
      >
        Начать обучение
      </button>

    </div>
  );
}