import BottomNav from "../../components/layout/BottomNav";
import StatItem from "../../components/profile/StatItem";

import { useUser }
from "../../context/UserContext";

export default function Profile() {
    const { user } = useUser();
    return (
        <div
        style={{
            padding: 20,
            paddingBottom: 100
        }}
        >
        {/* Avatar */}

        <div
            style={{
            display: "flex",
            justifyContent: "center"
            }}
        >
            <div
            style={{
                width: 120,
                height: 120,

                borderRadius: "50%",

                background: "#666",

                display: "flex",

                alignItems: "center",

                justifyContent: "center"
            }}
            >
            avatar
            </div>
        </div>

        <h2
            style={{
            textAlign: "center",
            marginTop: 20
            }}
        >
            {user.username}
        </h2>

        <div
            style={{
            marginTop: 30
            }}
        >
            <StatItem
            icon="⭐"
            value={`${user.xp} XP`}
            label="Получено опыта"
            />

            <StatItem
            icon="🔥"
            value={user.streak}
            label="Дней подряд"
            />

            <StatItem
            icon="📚"
            value={user.completedLessons}
            label="Уроков завершено"
            />
        </div>

        <h2
            style={{
            marginTop: 30
            }}
        >
            Достижения
        </h2>

        <div
            style={{
            background: "#5A5A5A",
            borderRadius: 18,
            padding: 20,
            marginTop: 12
            }}
        >
            🏆 Первые шаги
        </div>

        <button
            style={{
            width: "100%",

            marginTop: 30,

            padding: 16,

            background: "#FF4D4D",

            border: "none",

            borderRadius: 18,

            color: "#fff",

            fontWeight: "bold"
            }}
        >
            Выйти
        </button>




        <BottomNav />
        </div>
    );
}