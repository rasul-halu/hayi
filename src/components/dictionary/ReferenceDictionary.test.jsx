import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReferenceDictionary from "./ReferenceDictionary";
import { searchReferenceDictionary, getReferenceDictionaryEntry } from "../../api/apiClient";
jest.mock("../../api/apiClient", () => ({ searchReferenceDictionary: jest.fn(), getReferenceDictionaryEntry: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  searchReferenceDictionary.mockResolvedValue({ entries: [{ id: "brat", headword: "БРАТ", excerpt: "1. стха" }], hasMore: true });
  getReferenceDictionaryEntry.mockResolvedValue({ entry: { id: "brat", headword: "БРАТ", rawBody: "1. стха. 2. якъадаш.\nдвоюродный брат", sourcePage: 55 } });
});
test("search, full article, return and pagination", async () => {
  render(<ReferenceDictionary />);
  expect(await screen.findByText("БРАТ")).not.toBeNull();
  fireEvent.change(screen.getByLabelText("Найти слово"), { target: { value: "стха" } });
  await waitFor(() => expect(searchReferenceDictionary).toHaveBeenLastCalledWith(expect.objectContaining({ q: "стха", page: 1 })));
  fireEvent.click(await screen.findByRole("button", { name: /БРАТ/ }));
  expect(await screen.findByText(/двоюродный брат/)).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /К результатам/ }));
  fireEvent.click(await screen.findByRole("button", { name: "Следующая страница" }));
  await waitFor(() => expect(searchReferenceDictionary).toHaveBeenLastCalledWith(expect.objectContaining({ q: "стха", page: 2 })));
});
test("failed requests expose retry and recover", async () => {
  searchReferenceDictionary.mockRejectedValueOnce(new Error("Не удалось загрузить словарь"));
  render(<ReferenceDictionary />);
  expect(await screen.findByRole("alert")).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Повторить/ }));
  expect(await screen.findByText("БРАТ")).not.toBeNull();
});
