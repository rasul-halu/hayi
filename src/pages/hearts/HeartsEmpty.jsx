import { useCallback, useEffect } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HeartCountdown from "../../components/hearts/HeartCountdown";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import { useUser } from "../../context/UserContext";
import lostMascot from "../../assets/mascot/lost.png";

export default function HeartsEmpty() {
  const navigate = useNavigate();
  const { user, refreshHearts } = useUser();
  const hearts = Number(user.hearts) || 0;
  const maxHearts = Number(user.maxHearts) || 5;
  const hasHeart = hearts > 0;

  const handleRefreshHearts = useCallback(() => {
    void refreshHearts();
  }, [refreshHearts]);

  useEffect(() => {
    handleRefreshHearts();
  }, [handleRefreshHearts]);

  return (
    <PageContainer
      style={{
        minHeight: "100dvh",
        padding: "18px 18px 28px",
        background: "#F4F7F2",
        color: "#2D2D2D",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <button
        type="button"
        aria-label="Назад"
        onClick={() => navigate("/home")}
        style={{
          width: 44,
          height: 44,
          borderRadius: 15,
          border: "2px solid #E3E6DF",
          background: "#FFFFFF",
          color: "#4B4B4B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 0 #D9D9D9",
          cursor: "pointer"
        }}
      >
        <AppIcon icon={ArrowLeft} size={22} />
      </button>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <AppCard
          style={{
            width: "100%",
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            boxShadow: "0 8px 0 #D9D9D9",
            borderRadius: 28,
            textAlign: "center",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 22,
              background: "#FFF0F0",
              color: "#FF4D4D",
              boxShadow: "0 5px 0 #FFD0D0",
              marginBottom: 14
            }}
          >
            <AppIcon icon={Heart} size={31} fill="currentColor" />
          </div>

          <img
            src={lostMascot}
            alt="Закончились сердца"
            style={{
              width: "min(72%, 220px)",
              height: 190,
              objectFit: "contain",
              margin: "0 auto 10px",
              display: "block"
            }}
          />

          <h1
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.05,
              fontWeight: 900
            }}
          >
            Сердца закончились
          </h1>

          <p
            style={{
              margin: "10px auto 20px",
              maxWidth: 300,
              color: "#6F746B",
              fontWeight: 800,
              lineHeight: 1.45
            }}
          >
            {hasHeart
              ? "Одно сердце восстановлено"
              : "Следующее сердце восстановится автоматически"}
          </p>

          <div
            style={{
              padding: 18,
              borderRadius: 22,
              background: "#F8FAF6",
              border: "2px solid #E6E6E6",
              boxShadow: "0 5px 0 #D9D9D9",
              marginBottom: 18
            }}
          >
            {hasHeart ? (
              <div
                style={{
                  color: "#58CC02",
                  fontSize: 21,
                  fontWeight: 900
                }}
              >
                Сейчас: {hearts} из {maxHearts}
              </div>
            ) : (
              <>
                <div
                  style={{
                    color: "#6F746B",
                    fontWeight: 900,
                    marginBottom: 6
                  }}
                >
                  Следующее сердце через
                </div>
                <HeartCountdown
                  nextHeartAt={user.nextHeartAt}
                  onComplete={handleRefreshHearts}
                />
                <div
                  style={{
                    marginTop: 8,
                    color: "#6F746B",
                    fontSize: 14,
                    fontWeight: 800
                  }}
                >
                  Каждый час восстанавливается одно сердце
                </div>
              </>
            )}
          </div>

          <AppButton onClick={() => navigate("/home")}>
            {hasHeart ? "Вернуться к урокам" : "На главную"}
          </AppButton>
        </AppCard>
      </div>
    </PageContainer>
  );
}
