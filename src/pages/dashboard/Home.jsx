import LessonNode from "../../components/lesson/LessonNode";
import PracticeCard from "../../components/dashboard/PracticeCard";
import BottomNav from "../../components/layout/BottomNav";
import StatCard from "../../components/dashboard/StatCard";

import { getCourseChapters }
from "../../data/courseHelpers";

import { useUser }
from "../../context/UserContext";

export default function Home() {
  const { user } = useUser();
  const chapters = getCourseChapters();

  return (
    <div
      style={{
        padding: 20,
        paddingBottom: 100
      }}
    >

      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20
        }}
      >
        <StatCard
          icon="🔥"
          value={user.streak}
        />

        <StatCard
          icon="⭐"
          value={`${user.xp} XP`}
        />
      </div>

      {/*Avatar*/}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 20
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,

            borderRadius: "50%",

            background: "#666"
          }}
        >
          avatar
        </div>
      </div>

      {chapters.map((chapter, chapterIndex) => (
        <div
          key={chapter.id}
          style={{
            marginTop:
              chapterIndex === 0
                ? 0
                : 40
          }}
        >
          <h2>
            {chapter.title}
          </h2>

          <p>
            {chapter.description}
          </p>

          <div
            style={{
              marginTop: 30
            }}
          >
            {chapter.lessons.map((lesson) => {

              const unlocked =
                user.unlockedLessonIds.includes(lesson.id);

              const completed =
                user.completedLessonIds.includes(lesson.id);

              return (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  unlocked={unlocked}
                  completed={completed}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Practice */}

      <h2
        style={{
          marginTop: 40
        }}
      >
        Практика
      </h2>

      <div
        style={{
          display: "flex",
          gap: 15,
          marginTop: 20
        }}
      >
        <PracticeCard
          emoji="🎧"
          title="Listening"
        />

        <PracticeCard
          emoji="📚"
          title="Vocabulary"
        />

        <PracticeCard
          emoji="🎤"
          title="Speaking"
        />
      </div>

      <BottomNav />

    </div>
  );
}
