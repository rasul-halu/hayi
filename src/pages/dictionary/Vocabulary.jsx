import { useState } from "react";

import { getVocabulary }
from "../../data/courseHelpers";

import WordCard from "../../components/dictionary/WordCard";

import BottomNav from "../../components/layout/BottomNav";

export default function Vocabulary() {

  const [search, setSearch] = useState("");
  const vocabulary = getVocabulary();

  const filteredWords =
    vocabulary.filter(word =>
      word.lezgi
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      word.russian
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div
      style={{
        padding: 20,
        paddingBottom: 100
      }}
    >
      <h1>Словарь</h1>

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Поиск..."
        style={{
          width: "100%",

          padding: 14,

          marginTop: 20,

          borderRadius: 12,

          border: "none"
        }}
      />

      <div
        style={{
          marginTop: 20
        }}
      >
        {filteredWords.map(word => (

          <WordCard
            key={word.id}
            lezgi={word.lezgi}
            russian={word.russian}
          />

        ))}
      </div>

      <BottomNav />

    </div>
  );
}
