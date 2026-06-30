import {
  Medal,
  Trophy
} from "lucide-react";
import BottomNav from "../../components/layout/BottomNav";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { leaderboardUsers } from "../../data/mockLeaderboard";
import { useUser } from "../../context/UserContext";

function getRankColor(rank) {
  if (rank === 1) {
    return "#FFD43B";
  }

  if (rank === 2) {
    return "#BDBDBD";
  }

  if (rank === 3) {
    return "#CD7F32";
  }

  return null;
}

export default function Leaderboard() {
  const { user } = useUser();

  const currentUser = {
    id: "current-user",
    username: user.username || "Вы",
    xpToday: Number(user.xp) || 0,
    avatar: "Вы"
  };

  const rankedUsers = [
    ...leaderboardUsers,
    currentUser
  ]
    .sort((a, b) => b.xpToday - a.xpToday)
    .map((leaderboardUser, index) => ({
      ...leaderboardUser,
      rank: index + 1
    }));

  const currentRank =
    rankedUsers.find(
      leaderboardUser =>
        leaderboardUser.id === currentUser.id
    );

  return (
    <PageContainer>
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          background: "#FFD43B",
          color: "#4B4B4B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 0 #E0B900",
          marginBottom: 14
        }}
      >
        <AppIcon icon={Trophy} size={30} />
      </div>

      <SectionTitle
        title="Лидеры дня"
        subtitle="Соревнуйся по XP, заработанному сегодня"
      />

      {currentRank && (
        <AppCard
          style={{
            marginBottom: 18,
            background: "#FFD43B",
            color: "#4B4B4B",
            boxShadow: "0 6px 0 #E0B900"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900"
              }}
            >
              {currentRank.avatar}
            </div>

            <div
              style={{
                flex: 1
              }}
            >
              <div
                style={{
                  fontWeight: "900"
                }}
              >
                Вы
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontSize: 14,
                  fontWeight: "800"
                }}
              >
                #{currentRank.rank} · {currentRank.xpToday} XP
              </div>
            </div>
          </div>
        </AppCard>
      )}

      <div>
        {rankedUsers.map(leaderboardUser => {
          const isCurrentUser =
            leaderboardUser.id === currentUser.id;

          return (
            <AppCard
              key={leaderboardUser.id}
              style={{
                marginBottom: 12,
                padding: 14,
                background: isCurrentUser
                  ? "#E9F8DD"
                  : "#FFFFFF",
                color: "#4B4B4B",
                boxShadow: isCurrentUser
                  ? "0 5px 0 #46A400"
                  : "0 5px 0 #D9D9D9",
                borderColor: isCurrentUser
                  ? "#58CC02"
                  : "#E6E6E6"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <div
                  style={{
                    width: 34,
                    textAlign: "center",
                    fontSize: leaderboardUser.rank <= 3
                      ? 24
                      : 16,
                    fontWeight: "900"
                  }}
                >
                  {leaderboardUser.rank <= 3 ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <AppIcon
                        icon={Medal}
                        size={25}
                        color={getRankColor(leaderboardUser.rank)}
                      />
                    </span>
                  ) : (
                    leaderboardUser.rank
                  )}
                </div>

                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#4B4B4B",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900"
                  }}
                >
                  {leaderboardUser.avatar}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  <div
                    style={{
                      fontWeight: "900",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {leaderboardUser.username}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      color: "#777",
                      fontSize: 13,
                      fontWeight: "800"
                    }}
                  >
                    {leaderboardUser.xpToday} XP сегодня
                  </div>
                </div>
              </div>
            </AppCard>
          );
        })}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
