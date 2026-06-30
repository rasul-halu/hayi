import { useEffect, useState } from "react";

export default function QuestionImage({
  image
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image?.src]);

  if (!image || hasError) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: 112,
        maxHeight: 220,
        marginBottom: 18,
        borderRadius: 20,
        background: "#FFFFFF",
        border: "2px solid #E6E6E6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: "0 4px 0 #D9D9D9"
      }}
    >
      <img
        src={image.src}
        alt={image.alt || ""}
        onError={() => setHasError(true)}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          maxHeight: 220,
          objectFit: "contain",
          padding: 12,
          boxSizing: "border-box"
        }}
      />
    </div>
  );
}
