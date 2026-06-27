import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div
      style={{
        padding: 24
      }}
    >
      <h1>Регистрация</h1>

      <input
        placeholder="Имя"
        style={{
          width: "100%",
          padding: 12,
          marginTop: 20
        }}
      />

      <input
        placeholder="Email"
        style={{
          width: "100%",
          padding: 12,
          marginTop: 12
        }}
      />

      <input
        type="password"
        placeholder="Пароль"
        style={{
          width: "100%",
          padding: 12,
          marginTop: 12
        }}
      />

      <button
        style={{
          width: "100%",
          marginTop: 20,
          padding: 14,
          background: "#58CC02",
          border: "none"
        }}
      >
        Создать аккаунт
      </button>

      <p
        style={{
          marginTop: 20
        }}
      >
        Уже есть аккаунт?
      </p>

      <Link to="/login">
        Войти
      </Link>
    </div>
  );
}