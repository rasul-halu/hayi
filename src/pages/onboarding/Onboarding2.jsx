import { useNavigate } from "react-router-dom";

export default function Onboarding2() {

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
          onboarding-2.png
        </div>

        <h1>
          Учитесь играя
        </h1>

        <p>
          Получайте опыт,
          открывайте новые уроки
          и поддерживайте стрик.
        </p>

      </div>

      <button
        onClick={() => navigate("/onboarding-3")}
      >
        Далее
      </button>

    </div>
  );
}