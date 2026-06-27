import { useNavigate } from "react-router-dom";

export default function Onboarding1() {

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

        {/* место для картинки */}

        <div
          style={{
            height: 220
          }}
        >
          onboarding-1.png
        </div>

        <h1>
          Добро пожаловать в Хайи
        </h1>

        <p>
          Изучайте лезгинский язык
          в игровой форме.
        </p>

      </div>

      <button
        onClick={() => navigate("/onboarding-2")}
      >
        Далее
      </button>

    </div>
  );
}