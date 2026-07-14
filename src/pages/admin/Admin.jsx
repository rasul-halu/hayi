import {
  BookOpen,
  HelpCircle,
  Layers,
  ShieldCheck,
  WholeWord
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAdminMe, hasTelegramAuthData } from "../../api/apiClient";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";

const adminSections = [
  {
    title: "Курсы",
    icon: Layers
  },
  {
    title: "Уроки",
    icon: BookOpen
  },
  {
    title: "Вопросы",
    icon: HelpCircle
  },
  {
    title: "Словарь",
    icon: WholeWord
  }
];

export default function Admin() {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(hasTelegramAuthData());
  const [error, setError] = useState("");
  const isTelegramMode = hasTelegramAuthData();

  const loadAdmin = useCallback(async () => {
    if (!isTelegramMode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminMe();
      setAdminData(data);
    } catch (loadError) {
      setAdminData(null);
      setError(
        loadError.status === 403
          ? "У вас нет доступа к админке."
          : loadError.status === 401
            ? "Админка доступна только после входа через Telegram."
            : "Не удалось проверить доступ."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isTelegramMode]);

  useEffect(() => {
    void loadAdmin();
  }, [loadAdmin]);

  if (!isTelegramMode) {
    return (
      <PageContainer
        style={{
          background: "#F4F7F2",
          color: "#2D2D2D"
        }}
      >
        <AppCard
          style={{
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            textAlign: "center",
            fontWeight: 900,
            boxShadow: "0 6px 0 #D9D9D9"
          }}
        >
          Админка доступна только внутри Telegram.
        </AppCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D"
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          background: "#E9F8DD",
          color: "#58CC02",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 0 #CFE2C4",
          marginBottom: 14
        }}
      >
        <AppIcon icon={ShieldCheck} size={30} />
      </div>

      <SectionTitle
        title="Админка Хайи"
        subtitle="Управление учебным контентом и настройками"
      />

      {isLoading ? (
        <AppCard
          style={{
            marginTop: 18,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            textAlign: "center",
            fontWeight: 900,
            boxShadow: "0 6px 0 #D9D9D9"
          }}
        >
          Проверяем доступ...
        </AppCard>
      ) : null}

      {error ? (
        <AppCard
          style={{
            marginTop: 18,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            textAlign: "center",
            boxShadow: "0 6px 0 #D9D9D9"
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 12 }}>
            {error}
          </div>

          <AppButton onClick={loadAdmin} variant="secondary">
            Повторить
          </AppButton>
        </AppCard>
      ) : null}

      {adminData?.admin ? (
        <>
          <AppCard
            style={{
              marginTop: 18,
              background: "#FFFFFF",
              color: "#2D2D2D",
              border: "2px solid #E6E6E6",
              boxShadow: "0 6px 0 #D9D9D9"
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#6F746B",
                fontWeight: 800
              }}
            >
              Администратор
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 22,
                fontWeight: 900
              }}
            >
              {adminData.user.firstName || adminData.user.username || "ADMIN"}
            </div>

            <div
              style={{
                marginTop: 6,
                color: "#58CC02",
                fontWeight: 900
              }}
            >
              {adminData.user.role}
            </div>
          </AppCard>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              marginTop: 18
            }}
          >
            {adminSections.map(section => (
              <button
                key={section.title}
                type="button"
                disabled
                style={{
                  minHeight: 112,
                  borderRadius: 18,
                  border: "2px solid #E6E6E6",
                  background: "#FFFFFF",
                  color: "#2D2D2D",
                  boxShadow: "0 5px 0 #D9D9D9",
                  display: "grid",
                  justifyItems: "center",
                  alignContent: "center",
                  gap: 10,
                  fontWeight: 900,
                  opacity: 0.78
                }}
              >
                <AppIcon icon={section.icon} size={28} color="#58CC02" />
                {section.title}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
