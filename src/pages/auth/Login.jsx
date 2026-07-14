import {
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import AppIcon from "../../components/ui/AppIcon";
import { useUser } from "../../context/UserContext";
import mascot from "../../assets/mascot/main-mascot.png";
import {
  getTelegramInitData,
  getTelegramUserUnsafe,
  isTelegramWebApp
} from "../../utils/telegram";

export default function Login() {
  const navigate = useNavigate();
  const {
    authError: contextAuthError,
    authStatus,
    authenticateTelegramUser,
    login,
    user
  } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const telegramUser = useMemo(
    () => getTelegramUserUnsafe(),
    []
  );

  const telegramInitData = useMemo(
    () => getTelegramInitData(),
    []
  );

  const isTelegramMode = useMemo(
    () => isTelegramWebApp(),
    []
  );

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigate("/home");
    }
  }, [authStatus, navigate]);

  const displayName =
    user.authProvider === "telegram"
      ? user.displayName || user.username || "Ученик"
      : telegramUser?.first_name || telegramUser?.username || "Хайи";

  const handleGuestContinue = () => {
    login("Гость");
    navigate("/home");
  };

  const handleContinue = async () => {
    setAuthError("");

    if (!telegramInitData) {
      login("Гость");
      navigate("/home");
      return;
    }

    setIsLoading(true);

    try {
      await authenticateTelegramUser();
      navigate("/home");
    } catch (error) {
      setAuthError(
        error.message ||
          "Не удалось подтвердить Telegram. Попробуй ещё раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        padding: "24px 18px 28px",
        background: "#F4F7F2",
        color: "#2D2D2D",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 20,
          textAlign: "center",
          paddingTop: 20
        }}
      >
        <div
          style={{
            width: 172,
            height: 172,
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
              fontSize: 40,
              lineHeight: 1.08,
              fontWeight: 900
            }}
          >
            Готов начать?
          </h1>

          <p
            style={{
              margin: "12px auto 0",
              maxWidth: 360,
              color: "#6F746B",
              fontSize: 17,
              lineHeight: 1.45,
              fontWeight: 700
            }}
          >
            Мы сохраним твой прогресс и подстроим обучение под тебя.
          </p>
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 24,
            background: "#FFFFFF",
            color: "#4B4B4B",
            border: "2px solid #E6E6E6",
            boxShadow: "0 6px 0 #D9D9D9",
            display: "flex",
            alignItems: "center",
            gap: 14,
            textAlign: "left"
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "#E9F8DD",
              color: "#58CC02",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0
            }}
          >
            {user.authProvider === "telegram" && user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : telegramUser?.photo_url ? (
              <img
                src={telegramUser.photo_url}
                alt={displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <AppIcon icon={UserRound} size={30} />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {isTelegramMode ? `Привет, ${displayName}!` : "Можно начинать"}
            </div>

            <div
              style={{
                marginTop: 5,
                color: "#777",
                fontSize: 13,
                lineHeight: 1.35,
                fontWeight: 800
              }}
            >
              {isTelegramMode
                ? "Профиль Telegram найден"
                : "Открой приложение и продолжай обучение на этом устройстве."}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "#6F746B",
            fontSize: 13,
            fontWeight: 800
          }}
        >
          <AppIcon icon={ShieldCheck} size={17} color="#58CC02" />
          Авторизация через Telegram проверяется на сервере
        </div>

        {authError || contextAuthError ? (
          <div
            role="alert"
            style={{
              padding: "13px 14px",
              borderRadius: 16,
              background: "#FFF4F4",
              color: "#B3261E",
              border: "2px solid #FFDAD6",
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 800,
              textAlign: "left"
            }}
          >
            {authError || contextAuthError}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gap: 12
        }}
      >
        <AppButton
          onClick={handleContinue}
          disabled={isLoading || authStatus === "loading"}
          style={{
            minHeight: 62,
            borderRadius: 22,
            fontSize: 18
          }}
        >
          {isLoading || authStatus === "loading"
            ? "Подключаем Telegram..."
            : isTelegramMode && (authError || contextAuthError)
              ? "Повторить"
              : isTelegramMode
                ? `Продолжить как ${displayName}`
                : "Продолжить"}
        </AppButton>

        {authError && !isTelegramMode && process.env.NODE_ENV === "development" ? (
          <AppButton
            variant="secondary"
            onClick={handleGuestContinue}
            disabled={isLoading}
          >
            Продолжить
          </AppButton>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 7,
            color: "#6F746B",
            fontSize: 13,
            fontWeight: 800
          }}
        >
          <AppIcon icon={Sparkles} size={16} color="#FFD43B" />
          Без email и пароля
        </div>
      </div>
    </main>
  );
}
