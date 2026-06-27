export const course = {
  id: 1,
  title: "Хайи",
  language: "Лезгинский",
  description: "Базовый курс лезгинского языка для первых ежедневных уроков.",

  chapters: [
    {
      id: 1,
      title: "Глава 1",
      description: "Первые слова",

      lessons: [
        {
          id: 1,
          title: "Приветствие",
          description: "Учимся узнавать и переводить простые приветствия.",
          xpReward: 10,

          questions: [
            {
              id: 1,
              type: "translate",
              prompt: "Что означает:",
              question: "Салам",
              answers: [
                "Спасибо",
                "Привет",
                "Пока"
              ],
              correct: "Привет"
            },

            {
              id: 2,
              type: "match",
              prompt: "Сопоставь слова и переводы:",
              question: "Найди пары",
              answers: [
                "Пока",
                "Привет",
                "Спасибо"
              ],
              pairs: [
                {
                  word: "Салам",
                  translation: "Привет"
                },
                {
                  word: "Рахмат",
                  translation: "Спасибо"
                },
                {
                  word: "Хайыр",
                  translation: "Пока"
                }
              ],
              translations: [
                "Пока",
                "Привет",
                "Спасибо"
              ],
              correct: "Салам:Привет|Рахмат:Спасибо|Хайыр:Пока"
            },

            {
              id: 3,
              type: "listening",
              prompt: "Что ты слышишь?",
              question: "Аудио будет добавлено позже",
              answers: [
                "Салам",
                "Рахмат",
                "Хайыр"
              ],
              correct: "Салам"
            }
          ]
        },

        {
          id: 2,
          title: "Базовые слова",
          description: "Несколько слов для первого словаря.",
          xpReward: 10,

          questions: [
            {
              id: 4,
              type: "translate",
              prompt: "Что означает:",
              question: "Сагърай",
              answers: [
                "Спасибо",
                "Доброе утро",
                "Пока"
              ],
              correct: "Спасибо"
            }
          ]
        }
      ]
    },

    {
      id: 2,
      title: "Глава 2",
      description: "Темы для практики",

      lessons: [
        {
          id: 3,
          title: "Семья",
          description: "Заготовка будущего урока о семье.",
          xpReward: 10,
          questions: []
        },
        {
          id: 4,
          title: "Еда",
          description: "Заготовка будущего урока о еде.",
          xpReward: 10,
          questions: []
        },
        {
          id: 5,
          title: "Путешествия",
          description: "Заготовка будущего урока о путешествиях.",
          xpReward: 10,
          questions: []
        }
      ]
    }
  ],

  vocabulary: [
    {
      id: 1,
      lezgi: "Салам",
      russian: "Привет",
      chapterId: 1,
      lessonId: 1
    },
    {
      id: 2,
      lezgi: "Рахмат",
      russian: "Спасибо",
      chapterId: 1,
      lessonId: 1
    },
    {
      id: 3,
      lezgi: "Хайыр",
      russian: "Пока",
      chapterId: 1,
      lessonId: 1
    },
    {
      id: 4,
      lezgi: "Сагърай",
      russian: "Спасибо",
      chapterId: 1,
      lessonId: 2
    },
    {
      id: 5,
      lezgi: "Яхцӏа",
      russian: "Хорошо",
      chapterId: 1,
      lessonId: 2
    },
    {
      id: 6,
      lezgi: "Вун",
      russian: "Ты",
      chapterId: 1,
      lessonId: 2
    }
  ]
};
