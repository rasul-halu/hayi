import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function Login() {
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const { login } = useUser();

  const handleLogin = () => {

    login(username);

    navigate("/home");
  };


  return (
    <div
      style={{
        padding: 24
      }}
    >
      <h1>Вход</h1>
      
      <TextInput
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
        placeholder="Введите имя"
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

      <PrimaryButton
        onClick={handleLogin}
      >
        Войти
      </PrimaryButton>

      <p
        style={{
          marginTop: 20
        }}
      >
        Нет аккаунта?
      </p>

      <Link to="/register">
        Зарегистрироваться
      </Link>
    </div>
  );
}