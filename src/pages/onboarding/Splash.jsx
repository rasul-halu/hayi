import ScreenWrapper from "../../components/layout/ScreenWrapper";
import mascot from "../../assets/masсot/Главныймаскот.png";
import { useNavigate } from "react-router-dom";

export default function Splash() {
    const navigate = useNavigate();
    return (
        <ScreenWrapper>

        <div
            style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "90vh"
            }}
        >

            <div />

            <div>

            <h1
                style={{
                color: "#58CC02",
                textAlign: "center",
                fontSize: "48px"
                }}
            >
                ХАЙИ
            </h1>

            <p
                style={{
                textAlign: "center",
                marginTop: "12px"
                }}
            >
                Изучать язык легко
            </p>

            </div>
            <button onClick={() => navigate("/onboarding-1")}>
                Начать
            </button>

            {/* МЕСТО ДЛЯ МАСКОТА */}

            <img
                src={mascot}
                alt="Маскот Хайи"
                style={{
                    width: 240,
                    height: 240,
                    objectFit: "contain"
                }}
            />

        </div>

        

        </ScreenWrapper>
    );
}