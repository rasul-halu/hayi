import { useEffect, useRef } from "react";
import {
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import { getLessonById }
from "../../data/courseHelpers";

import { useUser }
from "../../context/UserContext";

import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import { playLessonCompleteSound } from "../../utils/soundEffects";

const DEFAULT_XP_REWARD = 10;

export default function LessonComplete() {
    
    const navigate = useNavigate();
    const location = useLocation();
    const didComplete = useRef(false);

    const {
        user,
        completeLessonWithSync
    } = useUser();

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
        void completeLessonWithSync(lessonId, xpReward);
        playLessonCompleteSound(user.soundEnabled);
    }, [
        completeLessonWithSync,
        lessonId,
        user.soundEnabled,
        xpReward
    ]);

    const handleContinue = () => {
        navigate("/home");
    };
    
    return (
        <PageContainer
        style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center"
        }}
        >
        <AppCard
            style={{
            padding: 26
            }}
        >
            <div
            style={{
                width: 180,
                height: 180,
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "#FFFFFF",
                color: "#4B4B4B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                boxShadow: "0 8px 0 #D9D9D9"
            }}
            >
            <AppIcon
                icon={CheckCircle2}
                size={82}
                color="#58CC02"
                strokeWidth={2.2}
            />
            </div>

            <h1
            style={{
                margin: 0,
                color: "#FFFFFF",
                fontSize: 34,
                fontWeight: "900"
            }}
            >
            Урок завершён!
            </h1>

            <div
            style={{
                marginTop: 18,
                padding: "14px 18px",
                borderRadius: 18,
                background: "#FFD43B",
                color: "#4B4B4B",
                fontSize: 24,
                fontWeight: "900",
                boxShadow: "0 5px 0 #E0B900"
            }}
            >
            +{xpReward} XP
            </div>

            <p
            style={{
                margin: "18px 0 0",
                color: "#D9D9D9",
                lineHeight: 1.4
            }}
            >
            Отличная работа. Здесь позже появится
            картинка маскота.
            </p>
        </AppCard>

        <AppButton
            onClick={handleContinue}
            style={{
            marginTop: 24
            }}
        >
            <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
            }}
            >
            Продолжить
            <AppIcon icon={ArrowRight} size={20} />
            </span>
        </AppButton>

        </PageContainer>
    );
}
