import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { geocodeSearch } from '../lib/api';

export default function SearchBar({ onSelect, placeholder = 'Search city...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function onChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timer.current);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const data = await geocodeSearch(val);
        setResults(data.slice(0, 5));
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  }

  function onSelect_(r) {
    setQuery(r.city);
    setOpen(false);
    setResults([]);
    onSelect(r);
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative flex items-center">
        <Search size={15} className="absolute left-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={onChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="input-field pl-9 pr-4"
        />
        {loading && (
          <div className="absolute right-3.5 w-3.5 h-3.5 border-[1.5px] border-slate-600 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full glass-raised rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => onSelect_(r)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
              >
                <MapPin size={13} className="text-slate-500 flex-shrink-0" />
                <span className="truncate">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
