import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { getReferenceDictionaryEntry, searchReferenceDictionary } from "../../api/apiClient";
import "./ReferenceDictionary.css";

export default function ReferenceDictionary() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const timer = setTimeout(async () => {
      try {
        const data = selected
          ? await getReferenceDictionaryEntry(selected, { signal: controller.signal })
          : await searchReferenceDictionary({ q: query, page, signal: controller.signal });
        if (!controller.signal.aborted) { if (selected) setEntry(data.entry); else setResult(data); }
      } catch (err) { if (!controller.signal.aborted) setError(err.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, selected ? 0 : 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, page, selected, attempt]);

  const busy = () => { setLoading(true); setError(""); };
  return (
    <section className="reference-dictionary" aria-label="Словарь">
      {selected ? <button className="reference-back" onClick={() => { busy(); setSelected(null); }}><ArrowLeft size={20} /> К результатам</button> : (
        <label className="reference-search"><Search size={20} aria-hidden="true" />
          <input aria-label="Найти слово" placeholder="Найти слово" value={query} maxLength={120}
            onChange={event => { busy(); setQuery(event.target.value); setPage(1); }} />
        </label>
      )}
      {loading && <div role="status" className="reference-loading">Загружаем словарь...</div>}
      {!loading && error && <div role="alert" className="reference-error"><p>{error}</p><button onClick={() => { busy(); setAttempt(x => x + 1); }}><RefreshCw size={18} /> Повторить</button></div>}
      {!loading && !error && selected && entry && <article>
        <h2>{entry.headword}{entry.homonymIndex && <sup>{entry.homonymIndex}</sup>}</h2>
        <p className="reference-body">{entry.rawBody || "В источнике текст статьи отсутствует."}</p>
      </article>}
      {!loading && !error && !selected && result && <>
        {result.entries.length === 0 ? <p className="reference-loading">Ничего не найдено</p> : <ul className="reference-results">
          {result.entries.map(item => <li key={item.id}><button onClick={() => { busy(); setEntry(null); setSelected(item.id); }}>
            <strong>{item.headword}{item.homonymIndex && <sup>{item.homonymIndex}</sup>}</strong>
            <span>{item.excerpt}</span><ChevronRight className="reference-chevron" size={20} aria-hidden="true" />
          </button></li>)}
        </ul>}
        {(page > 1 || result.hasMore) && <nav className="reference-pagination" aria-label="Страницы словаря">
          <button aria-label="Предыдущая страница" title="Предыдущая страница" disabled={page === 1} onClick={() => { busy(); setPage(x => x - 1); }}><ChevronLeft size={22} /></button>
          <span>Страница {page}</span>
          <button aria-label="Следующая страница" title="Следующая страница" disabled={!result.hasMore} onClick={() => { busy(); setPage(x => x + 1); }}><ChevronRight size={22} /></button>
        </nav>}
      </>}
    </section>
  );
}
