export default function PageContainer({
  children,
  style = {}
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "20px 18px 104px",
        background: "#4B4B4B",
        color: "#FFFFFF",
        boxSizing: "border-box",
        ...style
      }}
    >
      {children}
    </main>
  );
}
