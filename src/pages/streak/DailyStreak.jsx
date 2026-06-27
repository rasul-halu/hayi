import { useNavigate } from "react-router-dom";
import streakMascot from "../../assets/masсot/streak.png";

export default function DailyStreak() {

  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",

        display: "flex",

        flexDirection: "column",

        justifyContent: "center",

        alignItems: "center",

        padding: 24,

        textAlign: "center"
      }}
    >
      <div
        style={{
          fontSize: 70
        }}
      >
        🔥
      </div>

      <h1
        style={{
          color: "#58CC02",
          marginTop: 10
        }}
      >
        7 ДНЕЙ
      </h1>

      <p
        style={{
          marginTop: 10,
          color: "#D9D9D9"
        }}
      >
        Ты занимаешься уже
        7 дней подряд!
      </p>

      <img
        src={streakMascot}
        alt="Streak Mascot"
        style={{
          width: 240,
          marginTop: 30,
          objectFit: "contain"
        }}
      />

      <p
        style={{
          marginTop: 20,
          maxWidth: 300,
          color: "#D9D9D9"
        }}
      >
        Не прерывай серию.
        Вернись завтра и получи
        дополнительный опыт.
      </p>

      <button
        onClick={() => navigate("/home")}
        style={{
          marginTop: 30,

          width: "100%",

          maxWidth: 300,

          padding: 16,

          border: "none",

          borderRadius: 18,

          background: "#58CC02",

          color: "#fff",

          fontWeight: "bold",

          fontSize: 16
        }}
      >
        Продолжить
      </button>
 
    </div>
    
  );
}