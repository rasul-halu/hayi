import { Volume2 } from "lucide-react";
import AppIcon from "../ui/AppIcon";
import AnswerButton from "./AnswerButton";

export default function ListeningQuestion({
  question,
  selected,
  setSelected,
  disabled = false,
  feedbackStatus = "idle"
}) {
  return (
    <>
      <h2
        style={{
          margin: "0 0 18px",
          color: "#777",
          fontSize: 15,
          lineHeight: 1.35,
          fontWeight: "900",
          textTransform: "uppercase"
        }}
      >
        {question.prompt}
      </h2>

      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #E6E6E6",
          borderRadius: 22,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 5px 0 #D9D9D9",
          marginBottom: 24
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "#58CC02",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: "0 6px 0 #46A400"
          }}
        >
          <AppIcon
            icon={Volume2}
            size={42}
            color="#FFFFFF"
            strokeWidth={2.4}
          />
        </div>

        <p
          style={{
            margin: "18px 0 0",
            color: "#4B4B4B",
            fontWeight: "800"
          }}
        >
          Здесь будет аудио
        </p>
      </div>

      {question.answers.map(answer => (
        <AnswerButton
          key={answer}
          text={answer}
          selected={selected === answer}
          disabled={disabled}
          feedbackStatus={feedbackStatus}
          onClick={() =>
            setSelected(answer)
          }
        />
      ))}
    </>
  );
}
