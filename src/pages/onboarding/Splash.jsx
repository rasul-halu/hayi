import {
  Flame,
  Heart,
  Star
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import AppIcon from "../../components/ui/AppIcon";
import { useUser } from "../../context/UserContext";
import mascot from "../../assets/mascot/main-mascot.png";
import { isTelegramWebApp } from "../../utils/telegram";

function MiniStat({
  icon,
  label,
  color
}) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "10px 12px",
        borderRadius: 18,
        background: "#FFFFFF",
        color: "#4B4B4B",
        border: "2px solid #E6E6E6",
        boxShadow: "0 5px 0 #D9D9D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        fontSize: 13,
        fontWeight: 900,
        whiteSpace: "nowrap"
      }}
    >
      <AppIcon icon={icon} size={17} color={color} />
      {label}
    </div>
  );
}

function StartupLoading({
  authStatus,
  authError,
  onRetry
}) {
  const hasError = authStatus === "error";

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        padding: "calc(24px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom))",
        background: "#F4F7F2",
        color: "#2D2D2D",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          display: "grid",
          gap: 18
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            margin: "0 auto",
            borderRadius: 34,
            background: "#FFFFFF",
            border: "2px solid #E6E6E6",
            boxShadow: "0 8px 0 #D9D9D9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          <img
            className={hasError ? undefined : "startup-mascot-pulse"}
            src={mascot}
            alt="Маскот Хайи"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 10,
              boxSizing: "border-box"
            }}
          />
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              color: "#58CC02",
              fontSize: 44,
              lineHeight: 1,
              fontWeight: 900
            }}
          >
            Хайи
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#6F746B",
              fontSize: 17,
              fontWeight: 900
            }}
          >
            {hasError ? "Не удалось загрузить профиль" : "Подготавливаем Хайи..."}
          </p>
        </div>

        {!hasError ? (
          <div
            aria-hidden="true"
            style={{
              width: 172,
              height: 12,
              margin: "0 auto",
              borderRadius: 999,
              background: "#E2E7DE",
              overflow: "hidden"
            }}
          >
            <div
              className="startup-progress-bar"
              style={{
                width: 64,
                height: "100%",
                borderRadius: 999,
                background: "#58CC02"
              }}
            />
          </div>
        ) : (
          <>
            <p
              style={{
                margin: 0,
                color: "#D93B3B",
                fontSize: 14,
                lineHeight: 1.4,
                fontWeight: 800
              }}
            >
              {authError}
            </p>

            <AppButton onClick={onRetry}>
              Повторить
            </AppButton>
          </>
        )}
      </div>
    </main>
  );
}

export default function Splash() {
  const navigate = useNavigate();
  const {
    authError,
    authStatus,
    authenticateTelegramUser
  } = useUser();
  const isTelegramMode = isTelegramWebApp();

  useEffect(() => {
    if (!isTelegramMode) {
      return;
    }

    if (authStatus === "authenticated") {
      navigate("/home", { replace: true });
    }
  }, [
    authStatus,
    isTelegramMode,
    navigate
  ]);

  if (isTelegramMode) {
    return (
      <StartupLoading
        authStatus={authStatus}
        authError={authError}
        onRetry={() => {
          void authenticateTelegramUser().catch(() => {});
        }}
      />
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        padding: "calc(24px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom))",
        background: "#F4F7F2",
        color: "#2D2D2D",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          textAlign: "center",
          paddingTop: 14
        }}
      >
        <div
          style={{
            width: 236,
            height: 236,
            margin: "0 auto 18px",
            borderRadius: 36,
            background: "#FFFFFF",
            border: "2px solid #E6E6E6",
            boxShadow: "0 10px 0 #D9D9D9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          <img
            src={mascot}
            alt="Маскот Хайи"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 12,
              boxSizing: "border-box"
            }}
          />
        </div>

        <h1
          style={{
            margin: 0,
            color: "#58CC02",
            fontSize: 56,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: 0
          }}
        >
          Хайи
        </h1>

        <p
          style={{
            margin: "12px auto 0",
            maxWidth: 330,
            color: "#2D2D2D",
            fontSize: 22,
            lineHeight: 1.2,
            fontWeight: 900
          }}
        >
          Изучай лезгинский легко
        </p>

        <p
          style={{
            margin: "10px auto 0",
            maxWidth: 330,
            color: "#6F746B",
            fontSize: 15,
            lineHeight: 1.45,
            fontWeight: 700
          }}
        >
          Короткие уроки, серия дней и игровые задания
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 18
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8
          }}
        >
          <MiniStat icon={Flame} label="серия" color="#FF9600" />
          <MiniStat icon={Star} label="XP" color="#FFD43B" />
          <MiniStat icon={Heart} label="сердца" color="#FF4D4D" />
        </div>

        <AppButton
          onClick={() => navigate("/onboarding-1")}
          style={{
            minHeight: 62,
            borderRadius: 22,
            fontSize: 19
          }}
        >
          Начать
        </AppButton>
      </div>
    </main>
  );
}
