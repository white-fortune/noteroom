import { useState } from 'react';

export default function NoteSearchBar({ notiModalState }: { notiModalState: [any, any] }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]); 
  const [isLoading, setIsLoading] = useState(false);

  
  interface Note {
    id: number;
    title: string;
  }

  const handleSearch = (searchQuery: string): void => {
    setIsLoading(true);
    setTimeout(() => {
      const notes: Note[] = [
        { id: 1, title: 'Physics Chapter 1' },
        { id: 2, title: 'Math Chapter 3' },
      ];
      const filteredNotes: Note[] = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filteredNotes);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="search-container">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search Notes"
            aria-label="Search Notes"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <button className="search-button" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 30 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z" />
            </svg>
          </button>
        </div>
        <div className="notification-wrapper">
          <svg
            className="notification-button"
            onClick={() => notiModalState[1](!notiModalState[0])}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notification-badge" id="notification-count">
            0
          </span>
        </div>
        <a href="" aria-label="Profile">
          <img src="something" className="profile-avatar" alt="Profile" />
        </a>
      </div>
      <div className={`search-results-container ${isSearchFocused ? 'visible' : ''}`}>
        <div className="search-results-list">
          {isLoading ? (
            <div className="search-status" style={{ display: 'flex' }}>
              <div className="search-loading-indicator"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="no-results-message">
              No results
            </div>
          ) : (
            results.map((note) => (
              <div key={note.id} className="search-result-item">
                {note.title}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}