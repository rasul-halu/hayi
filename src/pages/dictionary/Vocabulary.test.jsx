import { render, screen } from "@testing-library/react";
import Vocabulary from "./Vocabulary";
import { searchReferenceDictionary } from "../../api/apiClient";
jest.mock("../../api/apiClient", () => ({ searchReferenceDictionary: jest.fn(), getReferenceDictionaryEntry: jest.fn() }));
jest.mock("../../components/layout/BottomNav", () => () => null);

test("renders only the full dictionary without legacy tabs or service labels", async () => {
  searchReferenceDictionary.mockResolvedValue({ entries: [{ id: "reference", headword: "БРАТ", excerpt: "1. стха. 2. якъадаш." }], hasMore: false });
  render(<Vocabulary />);
  expect(await screen.findByText("БРАТ")).not.toBeNull();
  expect(searchReferenceDictionary).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("tab")).toBeNull();
  expect(screen.queryByText("Слова уроков")).toBeNull();
  expect(screen.queryByText("Справочник и слова уроков")).toBeNull();
  expect(screen.queryByText("Справочник")).toBeNull();
  expect(screen.getByLabelText("Найти слово")).not.toBeNull();
});
