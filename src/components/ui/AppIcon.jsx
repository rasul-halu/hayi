export default function AppIcon({
  icon: Icon,
  size = 22,
  color = "currentColor",
  strokeWidth = 2.5,
  style = {},
  ...props
}) {
  if (!Icon) {
    return null;
  }

  return (
    <Icon
      aria-hidden="true"
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={{
        display: "block",
        flexShrink: 0,
        ...style
      }}
      {...props}
    />
  );
}
