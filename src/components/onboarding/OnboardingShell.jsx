import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "../ui/AppButton";
import PageDots from "./PageDots";
import StartupLoadingScreen from "./StartupLoadingScreen";
import { useUser } from "../../context/UserContext";
import { isTelegramWebApp } from "../../utils/telegram";

export default function OnboardingShell({
  activeIndex,
  title,
  text,
  visual,
  nextPath,
  primaryLabel,
  showSkip = true
}) {
  const navigate = useNavigate();
  const {
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
      return;
    }

    if (authStatus === "error") {
      navigate("/login", { replace: true });
    }
  }, [
    authStatus,
    isTelegramMode,
    navigate
  ]);

  if (isTelegramMode) {
    if (authStatus !== "error") {
      return <StartupLoadingScreen />;
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
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            padding: 22,
            borderRadius: 26,
            background: "#FFFFFF",
            border: "2px solid #E6E6E6",
            boxShadow: "0 7px 0 #D9D9D9"
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#58CC02",
              fontSize: 34,
              fontWeight: 900
            }}
          >
            Не удалось загрузить профиль
          </h1>

          <AppButton
            onClick={() => {
              void authenticateTelegramUser().catch(() => {});
            }}
            style={{
              marginTop: 22
            }}
          >
            Повторить
          </AppButton>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        padding: "calc(22px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom))",
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
          display: "flex",
          justifyContent: "flex-end",
          minHeight: 40
        }}
      >
        {showSkip ? (
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              border: "none",
              background: "transparent",
              color: "#6F746B",
              fontSize: 15,
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            Пропустить
          </button>
        ) : null}
      </div>

      <section
        style={{
          display: "grid",
          gap: 22
        }}
      >
        <div
          style={{
            minHeight: 250,
            padding: 20,
            borderRadius: 28,
            background: "#FFFFFF",
            color: "#4B4B4B",
            border: "2px solid #E6E6E6",
            boxShadow: "0 8px 0 #D9D9D9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {visual}
        </div>

        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.06,
              fontWeight: 900,
              letterSpacing: 0
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: "14px auto 0",
              maxWidth: 360,
              color: "#6F746B",
              fontSize: 17,
              lineHeight: 1.45,
              fontWeight: 700
            }}
          >
            {text}
          </p>
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gap: 18,
          marginTop: 28
        }}
      >
        <PageDots activeIndex={activeIndex} />

        <AppButton
          onClick={() => navigate(nextPath)}
          style={{
            minHeight: 60,
            borderRadius: 20
          }}
        >
          {primaryLabel}
        </AppButton>
      </div>
    </main>
  );
}
