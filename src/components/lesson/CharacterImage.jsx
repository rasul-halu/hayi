import { useEffect, useState } from "react";
import { resolveMediaImage } from "../../utils/mediaUrl";

export default function CharacterImage({
  image
}) {
  const [hasError, setHasError] = useState(false);
  const resolvedImage = resolveMediaImage(image);

  useEffect(() => {
    setHasError(false);
  }, [resolvedImage?.src]);

  if (!resolvedImage || hasError) {
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
        src={resolvedImage.src}
        alt={resolvedImage.alt || ""}
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
