export const course = {
  id: 1,
  title: "Хайи",
  language: "Лезгинский",
  description: "Базовый курс лезгинского языка для первых ежедневных уроков.",

  chapters: [
    {
      id: 1,
      title: "Глава 1",
      description: "Здоровайтесь и представляйтесь",

      lessons: [
        {
          id: 1,
          title: "Привет",
          description: "Учимся узнавать и переводить простые приветствия.",
          xpReward: 10,

          questions: [
            {
              id: 1,
              type: "translate",
              prompt: "Что означает:",
              question: "Салам",
              image: {
                src: "/images/lessons/карлик.png",
                alt: "Пример изображения к вопросу"
              },
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
            },

            {
              id: 4,
              type: "fillBlank",
              prompt: "Вставьте пропущенное слово",
              sentence: "Мен ____.",
              image: {
                src: "/images/lessons/example.png",
                alt: "Иллюстрация к предложению"
              },
              answers: [
                "вун",
                "заз",
                "чун"
              ],
              correct: "заз"
            },

            {
              id: "lesson-1-q-build-1",
              type: "buildSentence",
              prompt: "Соберите предложение",
              question: "Я ученик",
              targetSentence: "Зун ученик я",
              words: [
                "ученик",
                "я",
                "Зун"
              ],
              correct: "Зун ученик я",
              newWord: {
                text: "ученик",
                translation: "ученик"
              },
              characterImage: {
                src: "/images/characters/mascot-hello.png",
                alt: "Маскот"
              }
            },

            {
              id: "lesson-1-q-build-2",
              type: "buildSentence",
              prompt: "Соберите предложение",
              question: "У меня есть слово",
              targetSentence: "Заз гафар ава",
              words: [
                "ава",
                "Заз",
                "гафар"
              ],
              correct: "Заз гафар ава",
              newWords: [
                {
                  text: "Заз",
                  translation: "мне / у меня"
                },
                {
                  text: "гафар",
                  translation: "слово"
                }
              ],
              characterImage: {
                src: "/images/characters/mascot-hello.png",
                alt: "Маскот"
              }
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
              id: 5,
              type: "translate",
              prompt: "Что означает:",
              question: "Сагърай",
              answers: [
                "Спасибо",
                "Доброе утро",
                "Пока"
              ],
              correct: "Спасибо"
            },

            {
              id: 6,
              type: "fillBlank",
              prompt: "Вставьте пропущенное слово",
              sentence: "____, Салам!",
              answers: [
                "Рахмат",
                "Хайыр",
                "Сагърай"
              ],
              correct: "Рахмат"
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
