import { fireEvent, render, screen, within } from "@testing-library/react";
import Vocabulary from "./Vocabulary";
import { getPublicDictionary, searchReferenceDictionary } from "../../api/apiClient";
jest.mock("../../api/apiClient", () => ({ getPublicDictionary: jest.fn(), searchReferenceDictionary: jest.fn(), getReferenceDictionaryEntry: jest.fn() }));
jest.mock("../../components/layout/BottomNav", () => () => null);
jest.mock("../../data/courseHelpers", () => ({ getVocabulary: () => [] }));

test("reference and existing vocabulary APIs remain separate and usable", async () => {
  getPublicDictionary.mockResolvedValue({ words: [{ id: "old", russian: "Брат из урока", lezgian: "стха", exampleRussian: "Это мой брат" }] });
  searchReferenceDictionary.mockResolvedValue({ entries: [{ id: "reference", headword: "БРАТ", excerpt: "1. стха. 2. якъадаш." }], hasMore: false });
  render(<Vocabulary />);
  expect(await screen.findByText("БРАТ")).not.toBeNull();
  expect(getPublicDictionary).toHaveBeenCalledTimes(1);
  expect(searchReferenceDictionary).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("tab", { name: "Слова уроков" }));
  const panel = screen.getByRole("tabpanel", { name: "Слова уроков" });
  expect(within(panel).getByText("Брат из урока")).not.toBeNull();
  expect(within(panel).getByText("Это мой брат")).not.toBeNull();
  fireEvent.change(within(panel).getByPlaceholderText("Поиск..."), { target: { value: "стха" } });
  expect(within(panel).getByText("Брат из урока")).not.toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: "Справочник" }));
  expect(await screen.findByText("БРАТ")).not.toBeNull();
  expect(getPublicDictionary).toHaveBeenCalledTimes(1);
});
