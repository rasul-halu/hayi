export default function AppButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  style = {}
}) {
  const variants = {
    primary: {
      background: "#58CC02",
      borderColor: "#46A400",
      color: "#FFFFFF",
      boxShadow: "0 5px 0 #46A400"
    },
    secondary: {
      background: "#FFFFFF",
      borderColor: "#D9D9D9",
      color: "#4B4B4B",
      boxShadow: "0 5px 0 #D9D9D9"
    },
    muted: {
      background: "#5A5A5A",
      borderColor: "#444",
      color: "#FFFFFF",
      boxShadow: "0 5px 0 #3E3E3E"
    },
    yellow: {
      background: "#FFD43B",
      borderColor: "#E0B900",
      color: "#4B4B4B",
      boxShadow: "0 5px 0 #E0B900"
    }
  };

  const variantStyle =
    variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: 56,
        padding: "16px 18px",
        borderRadius: 16,
        border: `2px solid ${variantStyle.borderColor}`,
        cursor: disabled ? "default" : "pointer",
        fontSize: 17,
        fontWeight: "800",
        letterSpacing: 0,
        transform: disabled ? "translateY(3px)" : "none",
        opacity: disabled ? 0.65 : 1,
        ...variantStyle,
        ...style
      }}
    >
      {children}
    </button>
  );
}
