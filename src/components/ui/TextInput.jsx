export default function TextInput({
  value,
  onChange,
  placeholder
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",

        padding: 16,

        borderRadius: 16,

        border: "2px solid #666",

        background: "#5A5A5A",

        color: "#fff",

        fontSize: 16
      }}
    />
  );
}