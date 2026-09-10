import { fireEvent, render, screen } from "@testing-library/react";
import LessonComplete from "./LessonComplete";
import { useUser } from "../../context/UserContext";
import { hasTelegramAuthData } from "../../api/apiClient";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: "", state: { lessonId: "7", xpReward: 10 } })
}), { virtual: true });
jest.mock("../../context/UserContext", () => ({ useUser: jest.fn() }));
jest.mock("../../api/apiClient", () => ({ hasTelegramAuthData: jest.fn() }));
jest.mock("../../data/courseHelpers", () => ({ getLessonById: () => null }));
jest.mock("../../utils/soundEffects", () => ({ playLessonCompleteSound: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  hasTelegramAuthData.mockReturnValue(true);
});

test.each([
  [false, 10, "Прогресс сохранён.", "+10 XP"],
  [true, 0, "Урок пройден повторно — XP не начисляется.", "0 XP"]
])("uses confirmed server reward for repeat=%s", async (alreadyCompleted, xpAwarded, copy, xpText) => {
  const completeLessonWithSync = jest.fn().mockResolvedValue({ alreadyCompleted, xpAwarded });
  useUser.mockReturnValue({ user: { streak: 2, completedLessonIds: [] }, completeLessonWithSync });
  render(<LessonComplete />);
  expect(await screen.findByText(copy)).not.toBeNull();
  expect(screen.getByText(xpText)).not.toBeNull();
  expect(screen.getByText("Серия 2")).not.toBeNull();
  expect(completeLessonWithSync).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: /Продолжить/ }));
  expect(mockNavigate).toHaveBeenCalledWith("/home");
});

test("does not claim XP or saved progress when the server fails", async () => {
  useUser.mockReturnValue({
    user: { streak: 0, completedLessonIds: [] },
    completeLessonWithSync: jest.fn().mockResolvedValue(null)
  });
  render(<LessonComplete />);
  expect(await screen.findByText("Не удалось подтвердить сохранение прогресса.")).not.toBeNull();
  expect(screen.getByText("Начни серию")).not.toBeNull();
  expect(screen.queryByText("+10 XP")).toBeNull();
});

test("keeps the guest repeat snapshot after local completion updates the user", async () => {
  hasTelegramAuthData.mockReturnValue(false);
  useUser.mockReturnValue({
    user: { streak: 1, completedLessonIds: [7] },
    completeLessonWithSync: jest.fn().mockResolvedValue(null)
  });
  render(<LessonComplete />);
  expect(await screen.findByText("0 XP")).not.toBeNull();
  expect(screen.getByText("Урок пройден повторно — XP не начисляется.")).not.toBeNull();
});
