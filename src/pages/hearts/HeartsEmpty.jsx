import { useNavigate }
from "react-router-dom";

import { useUser }
from "../../context/UserContext";

export default function HeartsEmpty() {

  const navigate =
    useNavigate();

  const { resetHearts } =
    useUser();

  return (

    <div
      style={{
        padding: 24,
        textAlign: "center"
      }}
    >

      <h1>
        💔 Сердца закончились
      </h1>

      <p>
        Попробуйте снова
      </p>

      <button
        onClick={() => {

          resetHearts();

          navigate("/");
        }}
      >
        На главную
      </button>

    </div>
  );
}