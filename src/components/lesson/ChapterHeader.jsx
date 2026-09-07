import { BookOpen } from "lucide-react";
import AppIcon from "../ui/AppIcon";

export default function ChapterHeader({
  label,
  title,
  theme
}) {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "17px 16px 18px 18px",
        borderRadius: 18,
        background: theme.main,
        color: "#FFFFFF",
        boxShadow: `0 7px 0 ${theme.depth}`
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
        <div
          style={{
            marginBottom: 5,
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: 0
          }}
        >
          {label}
        </div>

        <h2
          style={{
            margin: 0,
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1.18,
            letterSpacing: 0,
            overflowWrap: "anywhere"
          }}
        >
          {title}
        </h2>
      </div>

      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          flex: "0 0 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          border: "2px solid rgba(255, 255, 255, 0.38)",
          background: "rgba(0, 0, 0, 0.09)",
          color: "#FFFFFF"
        }}
      >
        <AppIcon icon={BookOpen} size={25} strokeWidth={2.5} />
      </div>
    </div>
  );
}
