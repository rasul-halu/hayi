import LessonNode from "./LessonNode";

export default function LessonPath() {

  const lessons = [
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: true },
    { id: 4, locked: true },
    { id: 5, locked: true }
  ];

  return (
    <div
      style={{
        marginTop: 30
      }}
    >
      {lessons.map((lesson, index) => (

        <div
          key={lesson.id}
          style={{
            display: "flex",

            justifyContent:
              index % 2 === 0
                ? "flex-end"
                : "flex-start"
          }}
        >
          <LessonNode
            active={lesson.active}
            locked={lesson.locked}
          />
        </div>

      ))}
    </div>
  );
}