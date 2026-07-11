import { useEffect, useMemo, useState } from "react";
import { authenticateWithTelegram } from "../../api/apiClient";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import PageContainer from "../../components/ui/PageContainer";
import { useUser } from "../../context/UserContext";
import {
  getTelegramInitData,
  getTelegramWebApp,
  isTelegramWebApp
} from "../../utils/telegram";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000/api";

function getStorageFlag(key) {
  return Boolean(localStorage.getItem(key));
}

function DebugRow({ label, value }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <div
        style={{
          color: "#D9D9D9",
          fontWeight: "800",
          overflowWrap: "anywhere"
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#FFFFFF",
          fontWeight: "900",
          overflowWrap: "anywhere"
        }}
      >
        {String(value)}
      </div>
    </div>
  );
}

export default function DebugAuth() {
  const {
    authStatus,
    loadProgressFromServer,
    loadStatsFromServer,
    loginWithTelegramUser,
    user
  } = useUser();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState(null);

  const diagnostics = useMemo(() => {
    const initData = getTelegramInitData();
    const hasTelegramObject = Boolean(getTelegramWebApp());
    const hasInitData = initData.length > 0;
    const hash = window.location.hash || "";

    return {
      isTelegramWebApp: isTelegramWebApp(),
      hasTelegramObject,
      hasInitData,
      initDataLength: initData.length,
      authStatus,
      displayName: user.displayName || "",
      firstName: user.firstName || "",
      username: user.username || "",
      authProvider: user.authProvider || "",
      isGuest: Boolean(user.isGuest),
      backendUserIdExists: Boolean(user.backendUserId),
      telegramIdExists: Boolean(user.telegramId),
      apiUrl: API_URL,
      locationOrigin: window.location.origin,
      locationPathname: window.location.pathname,
      locationSearch: window.location.search,
      hasHash: hash.length > 0,
      hashContainsTgWebAppData: hash.includes("tgWebAppData="),
      hasHayiGuestUser: getStorageFlag("hayi-guest-user"),
      hasHayiTelegramUser: getStorageFlag("hayi-telegram-user"),
      hasOldHaiyiUser: getStorageFlag("haiyi-user"),
      hasOldHayiUser: getStorageFlag("hayi-user")
    };
  }, [
    authStatus,
    user.authProvider,
    user.backendUserId,
    user.displayName,
    user.firstName,
    user.isGuest,
    user.telegramId,
    user.username
  ]);

  useEffect(() => {
    console.log("AUTH DEBUG", {
      hasTelegramObject: diagnostics.hasTelegramObject,
      hasInitData: diagnostics.hasInitData,
      initDataLength: diagnostics.initDataLength,
      authStatus: diagnostics.authStatus,
      user: {
        displayName: diagnostics.displayName,
        authProvider: diagnostics.authProvider,
        isGuest: diagnostics.isGuest,
        backendUserIdExists: diagnostics.backendUserIdExists,
        telegramIdExists: diagnostics.telegramIdExists
      }
    });
  }, [diagnostics]);

  const handleRetry = async () => {
    const initData = getTelegramInitData();

    setRetryResult(null);

    if (!initData) {
      setRetryResult({
        status: "error",
        message: "initData is empty"
      });
      return;
    }

    setIsRetrying(true);

    try {
      const data = await authenticateWithTelegram(initData);

      if (!data.authenticated || !data.user) {
        throw new Error("Backend did not return authenticated user");
      }

      loginWithTelegramUser(data.user);

      await Promise.allSettled([
        loadStatsFromServer(),
        loadProgressFromServer()
      ]);

      setRetryResult({
        status: "success",
        message: "Telegram auth succeeded",
        user: {
          idExists: Boolean(data.user.id),
          telegramIdExists: Boolean(data.user.telegramId),
          firstName: data.user.firstName || "",
          username: data.user.username || "",
          avatarUrlExists: Boolean(data.user.avatarUrl)
        }
      });
    } catch (error) {
      setRetryResult({
        status: "error",
        message: error.message || "Telegram auth failed"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <PageContainer>
      <h1
        style={{
          margin: "0 0 14px",
          fontSize: 30,
          fontWeight: "900"
        }}
      >
        Auth Debug
      </h1>

      <AppCard
        style={{
          marginBottom: 18,
          background: "#FFD43B",
          color: "#4B4B4B",
          borderColor: "#E0B900",
          fontWeight: "900"
        }}
      >
        Техническая страница. Не для пользователей.
      </AppCard>

      <AppCard
        style={{
          color: "#FFFFFF"
        }}
      >
        <DebugRow label="isTelegramWebApp" value={diagnostics.isTelegramWebApp} />
        <DebugRow label="hasTelegramObject" value={diagnostics.hasTelegramObject} />
        <DebugRow label="hasInitData" value={diagnostics.hasInitData} />
        <DebugRow label="initDataLength" value={diagnostics.initDataLength} />
        <DebugRow label="authStatus" value={diagnostics.authStatus} />
        <DebugRow label="user.displayName" value={diagnostics.displayName} />
        <DebugRow label="user.firstName" value={diagnostics.firstName} />
        <DebugRow label="user.username" value={diagnostics.username} />
        <DebugRow label="user.authProvider" value={diagnostics.authProvider} />
        <DebugRow label="user.isGuest" value={diagnostics.isGuest} />
        <DebugRow label="backendUserId exists" value={diagnostics.backendUserIdExists} />
        <DebugRow label="telegramId exists" value={diagnostics.telegramIdExists} />
        <DebugRow label="REACT_APP_API_URL" value={diagnostics.apiUrl} />
        <DebugRow label="location.origin" value={diagnostics.locationOrigin} />
        <DebugRow label="location.pathname" value={diagnostics.locationPathname} />
        <DebugRow label="location.search" value={diagnostics.locationSearch} />
        <DebugRow label="hasHash" value={diagnostics.hasHash} />
        <DebugRow label="hashContainsTgWebAppData" value={diagnostics.hashContainsTgWebAppData} />
        <DebugRow label="has hayi-guest-user" value={diagnostics.hasHayiGuestUser} />
        <DebugRow label="has hayi-telegram-user" value={diagnostics.hasHayiTelegramUser} />
        <DebugRow label="has old haiyi-user" value={diagnostics.hasOldHaiyiUser} />
        <DebugRow label="has old hayi-user" value={diagnostics.hasOldHayiUser} />
      </AppCard>

      <AppButton
        onClick={handleRetry}
        disabled={isRetrying}
        style={{
          marginTop: 18
        }}
      >
        {isRetrying
          ? "Проверяем Telegram вход..."
          : "Повторить Telegram вход"}
      </AppButton>

      {retryResult ? (
        <AppCard
          style={{
            marginTop: 18,
            background:
              retryResult.status === "success"
                ? "#E9F8DD"
                : "#FFF4F4",
            color: "#4B4B4B",
            borderColor:
              retryResult.status === "success"
                ? "#58CC02"
                : "#FFDAD6"
          }}
        >
          <div
            style={{
              fontWeight: "900",
              marginBottom: 10
            }}
          >
            {retryResult.status}
          </div>

          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontSize: 13,
              fontWeight: "800"
            }}
          >
            {JSON.stringify(retryResult, null, 2)}
          </pre>
        </AppCard>
      ) : null}
    </PageContainer>
  );
}
