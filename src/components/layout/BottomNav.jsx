import { NavLink } from "react-router-dom";

export default function BottomNav() {

  const linkStyle = ({ isActive }) => ({
    color: isActive
      ? "#58CC02"
      : "#BDBDBD",

    textDecoration: "none",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    fontSize: 12,

    fontWeight: "600"
  });

  return (
    <div
      style={{
        position: "fixed",

        bottom: 0,

        left: 0,

        right: 0,

        height: 70,

        background: "#3E3E3E",

        borderTop: "1px solid #555",

        display: "flex",

        justifyContent: "space-around",

        alignItems: "center",

        zIndex: 1000
      }}
    >
      <NavLink
        to="/home"
        style={linkStyle}
      >
        <span style={{ fontSize: 22 }}>
          🏠
        </span>

        Главная
      </NavLink>

      <NavLink
        to="/dictionary"
        style={linkStyle}
      >
        <span style={{ fontSize: 22 }}>
          📚
        </span>

        Словарь
      </NavLink>

      <NavLink
        to="/streak"
        style={linkStyle}
      >
        <span style={{ fontSize: 22 }}>
          🔥
        </span>

        Серия
      </NavLink>

      <NavLink
        to="/profile"
        style={linkStyle}
      >
        <span style={{ fontSize: 22 }}>
          👤
        </span>

        Профиль
      </NavLink>
    </div>
  );
}