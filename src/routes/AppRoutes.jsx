import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "../pages/onboarding/Splash";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/dashboard/Home";

import Onboarding1 from "../pages/onboarding/Onboarding1";
import Onboarding2 from "../pages/onboarding/Onboarding2";
import Onboarding3 from "../pages/onboarding/Onboarding3";


import Profile from "../pages/profile/Profile";
import DailyStreak from "../pages/streak/DailyStreak";
import Vocabulary from "../pages/dictionary/Vocabulary";
import Alphabet from "../pages/alphabet/Alphabet";
import Admin from "../pages/admin/Admin";
import AdminCourses from "../pages/admin/AdminCourses";
import AdminLessonEditor from "../pages/admin/AdminLessonEditor";
import AdminLessonPreview from "../pages/admin/AdminLessonPreview";
import Leaderboard from "../pages/leaderboard/Leaderboard";
import Achievements from "../pages/achievements/Achievements";

import Lesson from "../pages/lessons/Lesson";
import LessonComplete from "../pages/lessons/LessonComplete";

import HeartsEmpty from "../pages/hearts/HeartsEmpty";
import DebugAuth from "../pages/debug/DebugAuth";

export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Splash />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/onboarding-1"
          element={<Onboarding1 />}
        />

        <Route
          path="/onboarding-2"
          element={<Onboarding2 />}
        />

        <Route
          path="/onboarding-3"
          element={<Onboarding3 />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/streak"
          element={<DailyStreak />}
        />

        <Route
          path="/dictionary"
          element={<Vocabulary />}
        />

        <Route
          path="/alphabet"
          element={<Alphabet />}
        />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        <Route
          path="/achievements"
          element={<Achievements />}
        />

        <Route
          path="/lesson/:lessonId"
          element={<Lesson />}
        />

        <Route
          path="/lesson-complete"
          element={<LessonComplete />}
        />

        <Route
          path="/hearts-empty"
          element={<HeartsEmpty />}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="/admin/courses"
          element={<AdminCourses />}
        />

        <Route
          path="/admin/lessons/:lessonId"
          element={<AdminLessonEditor />}
        />

        <Route
          path="/admin/lessons/:lessonId/preview"
          element={<AdminLessonPreview />}
        />

        <Route
          path="/debug-auth"
          element={<DebugAuth />}
        />

      </Routes>

      

    </BrowserRouter>
  );
}
