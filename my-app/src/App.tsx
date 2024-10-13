import './App.css';
import { useState, useEffect } from 'react';
import { ThemeContext, themes } from './themeContext';
import { dummyNotesList } from './constants';
import { Label } from './types';

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [label, setLabel] = useState(Label.other);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState(themes.light);
  const [notes, setNotes] = useState(dummyNotesList);
  const initialNote = {
    id: -1,
    title: '',
    content: '',
    label: Label.other,
  };
  const [createNote, setCreateNote] = useState(initialNote);
  const [popupMessage, setPopupMessage] = useState<string | null>(null); // State for popup messages

  // Ensure the note ID is unique (even after deletions)
  const generateUniqueId = () => {
    return notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1;
  };

  // Set the body theme on mount and when the theme changes
  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme === themes.light ? 'light' : 'dark');
  }, [currentTheme]);

  // Handle focus and blur events for input fields
  const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.target.style.backgroundColor = '#e0f7fa';  // Light blue background on focus
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.target.style.backgroundColor = '';  // Reset background on blur
  };

  // Handle form submission for new note creation or updating an existing note
  const createNoteHandler = (event: React.FormEvent) => {
    event.preventDefault();

    // Check if title already exists (for different note IDs)
    if (notes.some((note) => note.title === createNote.title && note.id !== createNote.id)) {
      setPopupMessage('Note title already exists, please choose a different title.'); // Show error for duplicate title
      return;
    }

    if (createNote.title.length > 50) {
      setPopupMessage('Title cannot be longer than 50 characters'); // Show error for length
      return;
    }

    // Handle editing existing note
    if (createNote.id !== -1) {
      const updatedNotes = notes.map((note) =>
        note.id === createNote.id ? { ...createNote } : note
      );
      setNotes(updatedNotes);
      
      // Update favorites if title changes
      setFavorites((prevFavorites) =>
        prevFavorites.map((favorite) => 
          favorite === notes.find((note) => note.id === createNote.id)?.title ? createNote.title : favorite
        )
      );
    } else {
      // Handle creating a new note with a unique ID
      setNotes([{ ...createNote, id: generateUniqueId() }, ...notes]);
      if (favorites.includes(createNote.title)) {
        setFavorites((prevFavorites) => [...prevFavorites, createNote.title]); // Add new title to favorites if it's new
      }
    }

    setCreateNote(initialNote); // Clear the form
    setPopupMessage(null); // Reset popup message
  };

  // Edit existing note
  const editNote = (note: any) => {
    setCreateNote(note); // Populate form fields with the note's values
  };

  // Toggle favorite status of a note
  const toggleFavorite = (noteTitle: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(noteTitle)
        ? prevFavorites.filter((title) => title !== noteTitle)
        : [...prevFavorites, noteTitle]
    );
  };

  // Delete note and remove it from favorites if applicable
  const deleteNote = (id: number) => {
    const noteToDelete = notes.find((note) => note.id === id);
    if (noteToDelete) {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id)); // Proper deletion based on ID
      setFavorites((prevFavorites) => prevFavorites.filter((title) => title !== noteToDelete.title)); // Remove favorite by title
    }
  };

  // Toggle light and dark theme
  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === themes.light ? themes.dark : themes.light));
  };

  return (
    <ThemeContext.Provider value={currentTheme}>
      <div className='app-container'>
        <form className="note-form" onSubmit={createNoteHandler}>
          <div>
            <input
              id="title"
              placeholder="Note Title"
              value={createNote.title}
              onChange={(event) =>
                setCreateNote({ ...createNote, title: event.target.value })
              }
              maxLength={50}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>

          <div>
            <textarea
              id="content"
              placeholder="Note Content"
              value={createNote.content}
              onChange={(event) =>
                setCreateNote({ ...createNote, content: event.target.value })
              }
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>

          <div>
            <select
              value={createNote.label}
              onChange={(event) =>
                setCreateNote({ ...createNote, label: event.target.value as Label })
              }
              required
            >
              <option value={Label.personal}>Personal</option>
              <option value={Label.study}>Study</option>
              <option value={Label.work}>Work</option>
              <option value={Label.other}>Other</option>
            </select>
          </div>

          <div>
            <button type="submit">{createNote.id !== -1 ? 'Update Note' : 'Create Note'}</button>
          </div>

          <div>
            <button type="button" onClick={toggleTheme}>
              Toggle Theme
            </button>
          </div>
        </form>

        {/* Popup for Title Errors */}
        {popupMessage && (
          <div className="error-popup">
            <div className="error-popup-content">
              <p>{popupMessage}</p>
              <button onClick={() => setPopupMessage(null)}>Close</button>
            </div>
          </div>
        )}

        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className="note-item">
              <div className="notes-header">
                <button onClick={() => editNote(note)}>Edit</button>
                <button
                  onClick={() => toggleFavorite(note.title)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                  }}
                >
                  {favorites.includes(note.title) ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="red"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                </button>
                <button onClick={() => deleteNote(note.id)} style={{ marginLeft: '10px' }}>x</button>
              </div>
              <h2 className="note-title">{note.title}</h2>
              <p className="note-content">{note.content}</p>
              <p>{note.label}</p>
            </div>
          ))} 
        </div>

        {/* Display list of favorited notes */}
        <div className="favorites-list">
          <h3 style={{ color: currentTheme.foreground }}>Favorited Notes:</h3>
          <ul>
            {favorites.map((favoriteTitle) => (
              <li key={favoriteTitle} style={{ color: currentTheme.foreground }}>{favoriteTitle}</li>
            ))}
          </ul>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
