import { render, screen } from "@testing-library/react";
import StartupLoadingScreen from "./StartupLoadingScreen";

test("renders only the loading mascot without visible loading copy", () => {
  const { container } = render(<StartupLoadingScreen />);
  const screenElement = screen.getByLabelText("Загрузка приложения");
  const mascot = container.querySelector(".startup-loading-mascot");

  expect(screenElement.getAttribute("aria-busy")).toBe("true");
  expect(screenElement.textContent).toBe("");
  expect(mascot.getAttribute("src")).toContain("loading-dark.png");
  expect(container.querySelector(".startup-progress-bar")).toBeNull();
});
