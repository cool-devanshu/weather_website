import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Clock, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocation: () => void;
  history: string[];
  onClearHistory: () => void;
  loading: boolean;
}

export function SearchBar({ onSearch, onLocation, history, onClearHistory, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
      setShowHistory(false);
    }
  };

  const handleHistorySelect = (city: string) => {
    setQuery(city);
    onSearch(city);
    setShowHistory(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => history.length > 0 && setShowHistory(true)}
            placeholder="Search for a city..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
          />
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/20 text-white backdrop-blur-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Searching
            </span>
          ) : (
            "Search"
          )}
        </button>

        {/* Location button */}
        <button
          type="button"
          onClick={onLocation}
          disabled={loading}
          title="Use my location"
          className="p-3.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/20 text-white backdrop-blur-md transition-all duration-300 disabled:opacity-50 active:scale-95"
        >
          <MapPin size={20} />
        </button>
      </form>

      {/* Search history dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden z-50 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-white/60 text-sm flex items-center gap-1.5">
              <Clock size={13} /> Recent searches
            </span>
            <button
              onClick={onClearHistory}
              className="text-white/40 hover:text-white/80 transition-colors text-xs flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          </div>
          {history.map((city, i) => (
            <button
              key={i}
              onClick={() => handleHistorySelect(city)}
              className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-3"
            >
              <Clock size={14} className="text-white/40 shrink-0" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
