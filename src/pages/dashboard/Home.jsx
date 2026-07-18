import {
  Flame,
  Headphones,
  Heart,
  Languages,
  Play,
  Star,
  Trophy,
  UserRound
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourse } from "../../api/apiClient";
import PracticeCard from "../../components/dashboard/PracticeCard";
import BottomNav from "../../components/layout/BottomNav";
import LessonNode from "../../components/lesson/LessonNode";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import StatPill from "../../components/ui/StatPill";
import { useUser } from "../../context/UserContext";
import { getCourseChapters } from "../../data/courseHelpers";
import { mapApiCourseToFrontendCourse } from "../../utils/courseApiAdapters";
import { getUserInitials } from "../../utils/userAvatar";
import mainMascot from "../../assets/mascot/thing.png";

function normalizeLessonId(id) {
  const numericId = Number(id);

  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  if (typeof id === "string" && id.trim().length > 0) {
    return id.trim();
  }

  return undefined;
}

function lessonIdListIncludes(list, lessonId) {
  const normalizedLessonId = normalizeLessonId(lessonId);

  return normalizedLessonId !== undefined &&
    list.some(id => normalizeLessonId(id) === normalizedLessonId);
}

export default function Home() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState("");
  const unlockedLessonIds = useMemo(
    () => Array.isArray(user.unlockedLessonIds)
      ? user.unlockedLessonIds
      : [],
    [user.unlockedLessonIds]
  );
  const completedLessonIds = useMemo(
    () => Array.isArray(user.completedLessonIds)
      ? user.completedLessonIds
      : [],
    [user.completedLessonIds]
  );
  const initials = getUserInitials(user);
  const displayName =
    user.displayName ||
    user.firstName ||
    user.username ||
    "Гость";

  const allLessons = useMemo(
    () => chapters.flatMap(chapter => chapter.lessons || []),
    [chapters]
  );

  const nextLesson = useMemo(() => {
    return allLessons.find(lesson => {
      const lessonId = normalizeLessonId(lesson.id);
      return (
        lessonIdListIncludes(unlockedLessonIds, lessonId) &&
        !lessonIdListIncludes(completedLessonIds, lessonId)
      );
    }) ||
      allLessons.find(lesson =>
        lessonIdListIncludes(unlockedLessonIds, lesson.id)
      ) ||
      allLessons[0];
  }, [allLessons, completedLessonIds, unlockedLessonIds]);

  const currentChapter = useMemo(() => {
    if (chapters.length === 0) {
      return null;
    }

    return chapters.find(chapter =>
      (chapter.lessons || []).some(lesson =>
        !lessonIdListIncludes(completedLessonIds, lesson.id)
      )
    ) || chapters[chapters.length - 1];
  }, [chapters, completedLessonIds]);

  const currentChapterIndex = Math.max(
    chapters.findIndex(chapter => chapter.id === currentChapter?.id),
    0
  );
  const currentChapterLessons = currentChapter?.lessons || [];
  const completedLessonsInChapter = currentChapterLessons.filter(lesson =>
    lessonIdListIncludes(completedLessonIds, lesson.id)
  ).length;
  const totalLessonsInChapter = currentChapterLessons.length;
  const chapterProgressPercent = totalLessonsInChapter > 0
    ? Math.round((completedLessonsInChapter / totalLessonsInChapter) * 100)
    : 0;
  const isCourseComplete =
    allLessons.length > 0 &&
    completedLessonIds.length >= allLessons.length;
  const continueLesson =
    currentChapterLessons.find(lesson =>
      !lessonIdListIncludes(completedLessonIds, lesson.id) &&
      lessonIdListIncludes(unlockedLessonIds, lesson.id)
    ) ||
    currentChapterLessons.find(lesson =>
      !lessonIdListIncludes(completedLessonIds, lesson.id)
    ) ||
    nextLesson;

  const loadCourse = useCallback(async () => {
    setIsCourseLoading(true);
    setCourseError("");
    setChapters([]);

    try {
      const data = await getCourse();
      const course = mapApiCourseToFrontendCourse(data.course);

      if (process.env.NODE_ENV === "development") {
        console.log("Course API loaded", {
          title: course.title,
          chapters: (course.chapters || []).map(chapter => ({
            title: chapter.title,
            description: chapter.description,
            lessons: (chapter.lessons || []).map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
            })),
          })),
        });
      }

      setChapters(course.chapters || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Course API loading failed, using local fallback:",
          error.message
        );
        setChapters(getCourseChapters());
      } else {
        setCourseError("Не удалось загрузить курс");
      }
    } finally {
      setIsCourseLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  const shouldShowCourseContent = !isCourseLoading && !courseError;

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D"
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#6F746B",
              fontWeight: 900,
              fontSize: 14
            }}
          >
            Добро пожаловать
          </p>
          <h1
            style={{
              margin: "4px 0 0",
              fontSize: 28,
              lineHeight: 1.05,
              fontWeight: 900
            }}
          >
            {displayName}
          </h1>
        </div>

        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 20,
            background: "#FFFFFF",
            color: "#4B4B4B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 24,
            boxShadow: "0 5px 0 #D9D9D9",
            overflow: "hidden",
            flexShrink: 0
          }}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : initials ? (
            initials
          ) : (
            <AppIcon icon={UserRound} size={28} />
          )}
        </div>
      </header>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16
        }}
      >
        <StatPill
          icon={<AppIcon icon={Flame} size={18} color="#FF9600" />}
          value={user.streak}
          label="серия"
        />
        <StatPill
          icon={<AppIcon icon={Heart} size={18} color="#FF4D4D" />}
          value={user.hearts}
          label="сердца"
        />
        <StatPill
          icon={<AppIcon icon={Star} size={18} color="#FFD43B" />}
          value={`${user.xp} XP`}
          label="опыт"
        />
      </div>

      <AppCard
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #FFFFFF 0%, #E9F8DD 100%)",
          color: "#2D2D2D",
          border: "2px solid #DDEED4",
          boxShadow: "0 7px 0 #CFE2C4",
          marginBottom: 18
        }}
      >
        <img
          src={mainMascot}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -42,
            top: -82,
            width: 220,
            height: 180,
            objectFit: "cover",
            objectPosition: "top center",
            opacity: 0.24,
            pointerEvents: "none",
            zIndex: 0
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                color: "#58CC02",
                fontWeight: 900,
                fontSize: 13
              }}
            >
              Текущий курс
            </p>
            {isCourseLoading ? (
              <>
                <h2
                  style={{
                    margin: "5px 0 6px",
                    fontSize: 24,
                    fontWeight: 900
                  }}
                >
                  Загружаем курс
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "#6F746B",
                    fontWeight: 800,
                    lineHeight: 1.35
                  }}
                >
                  Подготавливаем уроки и прогресс...
                </p>
              </>
            ) : (
              <>
                <h2
                  style={{
                    margin: "5px 0 6px",
                    fontSize: 24,
                    fontWeight: 900
                  }}
                >
                  Лезгинский язык
                </h2>
                {currentChapter ? (
                  <div
                    style={{
                      display: "inline-flex",
                      maxWidth: "100%",
                      marginBottom: 8,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(88, 204, 2, 0.14)",
                      color: "#46A400",
                      fontSize: 13,
                      fontWeight: 900,
                      lineHeight: 1.2
                    }}
                  >
                    Глава {currentChapterIndex + 1}: {currentChapter.title}
                  </div>
                ) : null}
                <p
                  style={{
                    margin: 0,
                    color: "#6F746B",
                    fontWeight: 800,
                    lineHeight: 1.35
                  }}
                >
                  {isCourseComplete
                    ? "Курс завершён"
                    : `${completedLessonsInChapter} из ${totalLessonsInChapter || 0} уроков главы завершено`}
                </p>
              </>
            )}
          </div>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
            background: "#58CC02",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            boxShadow: "0 5px 0 #46A400",
            flexShrink: 0,
            position: "relative",
            zIndex: 1
          }}
        >
            <AppIcon icon={Play} size={26} fill="currentColor" />
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            height: 13,
            borderRadius: 999,
            background: "#E2E7DE",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: isCourseLoading
                ? "34%"
                : `${Math.min(chapterProgressPercent, 100)}%`,
              height: "100%",
              borderRadius: 999,
              background: "#58CC02"
            }}
          />
        </div>

        {!isCourseLoading ? (
          <AppButton
            onClick={() => continueLesson && navigate(`/lesson/${continueLesson.id}`)}
            disabled={!continueLesson}
            style={{
              marginTop: 18,
              position: "relative",
              zIndex: 1
            }}
          >
            {isCourseComplete ? "Повторить курс" : "Продолжить обучение"}
          </AppButton>
        ) : null}
      </AppCard>

      {courseError ? (
        <AppCard
          style={{
            marginBottom: 18,
            background: "#FFFFFF",
            color: "#2D2D2D",
            textAlign: "center",
            border: "2px solid #E6E6E6",
            boxShadow: "0 6px 0 #D9D9D9"
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 12 }}>
            {courseError}
          </div>
          <AppButton onClick={loadCourse} variant="secondary">
            Повторить
          </AppButton>
        </AppCard>
      ) : null}

      {shouldShowCourseContent && chapters.map((chapter, chapterIndex) => (
        <AppCard
          key={chapter.id}
          style={{
            marginTop: chapterIndex === 0 ? 0 : 22,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            boxShadow: "0 7px 0 #D9D9D9"
          }}
        >
          <SectionTitle
            title={chapter.title}
            subtitle={chapter.description}
          />

          <div style={{ marginTop: 20 }}>
            {chapter.lessons.map((lesson, index) => {
              const unlocked = lessonIdListIncludes(unlockedLessonIds, lesson.id);
              const completed = lessonIdListIncludes(completedLessonIds, lesson.id);

              return (
                <div
                  key={lesson.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                    marginBottom: 18
                  }}
                >
                  <div
                    style={{
                      width: "62%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: index % 2 === 0 ? "flex-start" : "flex-end"
                    }}
                  >
                    <LessonNode
                      lesson={lesson}
                      unlocked={unlocked}
                      completed={completed}
                    />

                    <div
                      style={{
                        marginTop: 10,
                        color: unlocked ? "#2D2D2D" : "#8A8A8A",
                        fontSize: 14,
                        fontWeight: 900,
                        textAlign: index % 2 === 0 ? "left" : "right",
                        lineHeight: 1.2
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
        style={{ marginTop: 28 }}
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
          title="Аудирование"
          badge="Скоро"
          disabled
        />
        <PracticeCard
          icon={<AppIcon icon={Languages} size={25} />}
          title="Алфавит"
          onClick={() => navigate("/alphabet")}
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
