import { useEffect, useState } from "react";

export default function CharacterImage({
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
        maxHeight: 160,
        margin: "0 0 18px",
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
          maxHeight: 160,
          objectFit: "contain",
          padding: 10,
          boxSizing: "border-box"
        }}
      />
    </div>
  );
}
