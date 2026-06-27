import { useEffect, useRef } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import { getLessonById }
from "../../data/courseHelpers";

import { useUser }
from "../../context/UserContext";

const DEFAULT_XP_REWARD = 10;

export default function LessonComplete() {
    
    const navigate = useNavigate();
    const location = useLocation();
    const didComplete = useRef(false);

    const { completeLessonById } = useUser();

    const queryLessonId =
        new URLSearchParams(location.search)
            .get("lessonId");

    const lessonId =
        location.state?.lessonId ||
        queryLessonId;

    const lesson =
        getLessonById(lessonId);

    const xpReward =
        lesson?.xpReward ??
        DEFAULT_XP_REWARD;

    useEffect(() => {
        if (!lessonId || didComplete.current) {
            return;
        }

        didComplete.current = true;
        completeLessonById(lessonId, xpReward);
    }, [completeLessonById, lessonId, xpReward]);

    const handleContinue = () => {
        navigate("/home");
    };
    
    return (
        <div
        style={{
            minHeight: "100vh",

            display: "flex",

            flexDirection: "column",

            justifyContent: "center",

            alignItems: "center",

            textAlign: "center"
        }}
        >

        {/* mascot complete */}

        <div
            style={{
            width: 250,
            height: 250
            }}
        >
            lesson-complete.png
        </div>

        <h1
            style={{
            color: "#58CC02"
            }}
        >
            Урок завершён!
        </h1>

        <p>
            +{xpReward} XP
        </p>

        <button
            onClick={handleContinue}
            style={{
            marginTop: 20,
            padding: 18,
            width: 250,

            background: "#58CC02",

            border: "none",

            borderRadius: 18
            }}
        >
            Продолжить
        </button>

        </div>
    );
}
