import {
  BookOpen,
  Flame,
  House,
  UserRound
} from "lucide-react";
import { NavLink } from "react-router-dom";
import AppIcon from "../ui/AppIcon";

const links = [
  {
    to: "/home",
    icon: House,
    label: "Главная"
  },
  {
    to: "/dictionary",
    icon: BookOpen,
    label: "Словарь"
  },
  {
    to: "/streak",
    icon: Flame,
    label: "Серия"
  },
  {
    to: "/profile",
    icon: UserRound,
    label: "Профиль"
  }
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 76,
        background: "#FFFFFF",
        borderTop: "2px solid #E6E6E6",
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
        boxShadow: "0 -6px 18px rgba(0,0,0,0.18)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          alignItems: "center",
          padding: "6px 10px 10px",
          boxSizing: "border-box"
        }}
      >
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              color: isActive
                ? "#58CC02"
                : "#8A8A8A",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              minHeight: 58,
              borderRadius: 14,
              background: isActive
                ? "#E9F8DD"
                : "transparent",
              fontSize: 11,
              fontWeight: "900"
            })}
          >
            <AppIcon
              icon={link.icon}
              size={24}
            />

            <span>
              {link.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
