// Source of truth for seeded course content. After the course moved to the
// backend, production titles/descriptions should be changed here and pushed to
// PostgreSQL with `npm.cmd run prisma:seed` from the server directory.
export const courseSeed = {
  slug: "lezgian",
  title: "Хайи",
  language: "lezgian",
  description:
    "Базовый курс лезгинского языка для первых ежедневных уроков.",
  isPublished: true,
  order: 1,
  chapters: [
    {
      title: "Глава 1",
      description: "Здоровайтесь и представляйтесь",
      order: 1,
      lessons: [
        {
          legacyId: "1",
          title: "Приветствие",
          description:
            "Учимся узнавать и переводить простые приветствия.",
          order: 1,
          xpReward: 10,
          isPublished: true,
          questions: [
            {
              type: "translate",
              order: 1,
              prompt: "Что означает:",
              question: "Салам",
              answers: ["Спасибо", "Привет", "Пока"],
              correct: "Привет",
              image: {
                src: "/images/lessons/карлик.png",
                alt: "Пример изображения к вопросу",
              },
            },
            {
              type: "match",
              order: 2,
              prompt: "Сопоставь слова и переводы:",
              question: "Найди пары",
              answers: ["Пока", "Привет", "Спасибо"],
              pairs: [
                {
                  word: "Салам",
                  translation: "Привет",
                },
                {
                  word: "Рахмат",
                  translation: "Спасибо",
                },
                {
                  word: "Хайыр",
                  translation: "Пока",
                },
              ],
              translations: ["Пока", "Привет", "Спасибо"],
              correct: "Салам:Привет|Рахмат:Спасибо|Хайыр:Пока",
            },
            {
              type: "listening",
              order: 3,
              prompt: "Что ты слышишь?",
              question: "Аудио будет добавлено позже",
              answers: ["Салам", "Рахмат", "Хайыр"],
              correct: "Салам",
            },
            {
              type: "fillBlank",
              order: 4,
              prompt: "Вставьте пропущенное слово",
              sentence: "Мен ____.",
              answers: ["вун", "заз", "чун"],
              correct: "заз",
              image: {
                src: "/images/lessons/example.png",
                alt: "Иллюстрация к предложению",
              },
            },
            {
              type: "buildSentence",
              order: 5,
              prompt: "Соберите предложение",
              question: "Я ученик",
              targetSentence: "Зун ученик я",
              words: ["ученик", "я", "Зун"],
              correct: "Зун ученик я",
              newWord: {
                text: "ученик",
                translation: "ученик",
              },
              characterImage: {
                src: "/images/characters/mascot-hello.png",
                alt: "Маскот",
              },
            },
            {
              type: "buildSentence",
              order: 6,
              prompt: "Соберите предложение",
              question: "У меня есть слово",
              targetSentence: "Заз гафар ава",
              words: ["ава", "Заз", "гафар"],
              correct: "Заз гафар ава",
              newWords: [
                {
                  text: "Заз",
                  translation: "мне / у меня",
                },
                {
                  text: "гафар",
                  translation: "слово",
                },
              ],
              characterImage: {
                src: "/images/characters/mascot-hello.png",
                alt: "Маскот",
              },
            },
          ],
        },
        {
          legacyId: "2",
          title: "Базовые слова",
          description: "Несколько слов для первого словаря.",
          order: 2,
          xpReward: 10,
          isPublished: true,
          questions: [
            {
              type: "translate",
              order: 1,
              prompt: "Что означает:",
              question: "Сагърай",
              answers: ["Спасибо", "Доброе утро", "Пока"],
              correct: "Спасибо",
            },
            {
              type: "fillBlank",
              order: 2,
              prompt: "Вставьте пропущенное слово",
              sentence: "____, Салам!",
              answers: ["Рахмат", "Хайыр", "Сагърай"],
              correct: "Рахмат",
            },
          ],
        },
      ],
    },
    {
      title: "Глава 2",
      description: "Темы для практики",
      order: 2,
      lessons: [
        {
          legacyId: "3",
          title: "Семья",
          description: "Заготовка будущего урока о семье.",
          order: 1,
          xpReward: 10,
          isPublished: true,
          questions: [],
        },
        {
          legacyId: "4",
          title: "Еда",
          description: "Заготовка будущего урока о еде.",
          order: 2,
          xpReward: 10,
          isPublished: true,
          questions: [],
        },
        {
          legacyId: "5",
          title: "Путешествия",
          description: "Заготовка будущего урока о путешествиях.",
          order: 3,
          xpReward: 10,
          isPublished: true,
          questions: [],
        },
      ],
    },
  ],
};
