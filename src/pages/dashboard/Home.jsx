import {
  BookText,
  Flame,
  Headphones,
  Heart,
  Star,
  Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PracticeCard from "../../components/dashboard/PracticeCard";
import BottomNav from "../../components/layout/BottomNav";
import LessonNode from "../../components/lesson/LessonNode";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import StatPill from "../../components/ui/StatPill";
import { useUser } from "../../context/UserContext";
import { getCourseChapters } from "../../data/courseHelpers";

export default function Home() {
  const { user } = useUser();
  const navigate = useNavigate();
  const chapters = getCourseChapters();
  const unlockedLessonIds =
    Array.isArray(user.unlockedLessonIds)
      ? user.unlockedLessonIds
      : [];
  const completedLessonIds =
    Array.isArray(user.completedLessonIds)
      ? user.completedLessonIds
      : [];

  return (
    <PageContainer>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 22
        }}
      >
        <StatPill
          icon={<AppIcon icon={Flame} size={18} color="#FF9600" />}
          value={user.streak}
        />

        <StatPill
          icon={<AppIcon icon={Heart} size={18} color="#FF4D4D" />}
          value={user.hearts}
        />

        <StatPill
          icon={<AppIcon icon={Star} size={18} color="#FFD43B" />}
          value={`${user.xp} XP`}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 22
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "#FFFFFF",
            color: "#4B4B4B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "900",
            boxShadow: "0 6px 0 #D9D9D9"
          }}
        >
          avatar
        </div>
      </div>

      {chapters.map((chapter, chapterIndex) => (
        <AppCard
          key={chapter.id}
          style={{
            marginTop:
              chapterIndex === 0
                ? 0
                : 22
          }}
        >
          <SectionTitle
            title={chapter.title}
            subtitle={chapter.description}
          />

          <div
            style={{
              marginTop: 20
            }}
          >
            {chapter.lessons.map((lesson, index) => {
              const unlocked =
                unlockedLessonIds.includes(lesson.id);

              const completed =
                completedLessonIds.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      index % 2 === 0
                        ? "flex-start"
                        : "flex-end",
                    marginBottom: 18
                  }}
                >
                  <div
                    style={{
                      width: "58%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        index % 2 === 0
                          ? "flex-start"
                          : "flex-end"
                    }}
                  >
                    <LessonNode
                      lesson={lesson}
                      unlocked={unlocked}
                      completed={completed}
                    />

                    <div
                      style={{
                        marginTop: 8,
                        color: unlocked
                          ? "#FFFFFF"
                          : "#D9D9D9",
                        fontSize: 14,
                        fontWeight: "800",
                        textAlign:
                          index % 2 === 0
                            ? "left"
                            : "right"
                      }}
                    >
                      {lesson.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AppCard>
      ))}

      <SectionTitle
        title="Практика"
        style={{
          marginTop: 28
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 12
        }}
      >
        <PracticeCard
          icon={<AppIcon icon={Headphones} size={25} />}
          title="Listening"
        />

        <PracticeCard
          icon={<AppIcon icon={BookText} size={25} />}
          title="Vocabulary"
        />

        <PracticeCard
          icon={<AppIcon icon={Trophy} size={25} />}
          title="Лидеры"
          onClick={() => navigate("/leaderboard")}
        />
      </div>

      <BottomNav />
    </PageContainer>
  );
}
