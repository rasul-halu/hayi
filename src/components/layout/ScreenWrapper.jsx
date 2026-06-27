export default function ScreenWrapper({
  children
}) {

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px"
      }}
    >
      {children}
    </div>
  );
}