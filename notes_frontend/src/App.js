import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000"; // Change as needed for your backend port

// Helper to fetch notes from backend API
async function fetchNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

async function fetchNote(noteId) {
  const res = await fetch(`${API_BASE}/notes/${noteId}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
}

async function createNote(note) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

async function updateNote(noteId, note) {
  const res = await fetch(`${API_BASE}/notes/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

async function deleteNote(noteId) {
  const res = await fetch(`${API_BASE}/notes/${noteId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
}

/* ---- SIDEBAR COMPONENT ---- */
function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreate,
  onDelete,
  theme,
}) {
  return (
    <nav
      className="sidebar"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
        <span style={{ fontWeight: "bold", fontSize: 22, color: "var(--primary-color, #1976d2)" }}>
          Notes
        </span>
        <button
          className="btn create-btn"
          style={{
            marginLeft: 12,
            color: "var(--button-text)",
            backgroundColor: "var(--primary-color, #1976d2)",
          }}
          onClick={onCreate}
          aria-label="Create note"
        >
          + New
        </button>
      </div>
      <ul className="notes-list" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {notes.length === 0 && (
          <li style={{ padding: "1rem", color: "#aaa" }}>No notes yet</li>
        )}
        {notes.map((note) => (
          <li
            key={note.id}
            className={note.id === selectedNoteId ? "active" : ""}
            style={{
              padding: "0.75rem 1rem",
              cursor: "pointer",
              background:
                note.id === selectedNoteId
                  ? "var(--primary-color, #1976d2)"
                  : "transparent",
              color:
                note.id === selectedNoteId
                  ? "#fff"
                  : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "background 0.2s",
            }}
            onClick={() => onSelectNote(note.id)}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 500,
                flex: 1,
                marginRight: ".5rem",
              }}
              title={note.title}
            >
              {note.title || <em style={{ color: "#bbb" }}>Untitled</em>}
            </span>
            <button
              aria-label="Delete note"
              className="sidebar-delete-btn"
              style={{
                background: "none",
                border: "none",
                color:
                  note.id === selectedNoteId
                    ? "#ffd5bf"
                    : "var(--accent-color, #ffb300)",
                cursor: "pointer",
                fontSize: 15,
                marginLeft: 2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---- NOTE FORM COMPONENT (CREATE/EDIT) ---- */
function NoteForm({ initialNote, onSave, onCancel }) {
  const [form, setForm] = useState(initialNote);

  useEffect(() => {
    setForm(initialNote);
  }, [initialNote]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() && !form.content.trim()) return;
    onSave(form);
  }

  return (
    <form
      className="note-form"
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <input
        name="title"
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        autoFocus
        className="note-title-input"
        style={{
          fontSize: 22,
          padding: ".5rem",
          border: "1px solid var(--border-color)",
          borderRadius: 5,
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
      />
      <textarea
        name="content"
        rows={10}
        placeholder="Start writing your note..."
        value={form.content}
        onChange={handleChange}
        className="note-content-input"
        style={{
          fontSize: 16,
          padding: ".5rem",
          border: "1px solid var(--border-color)",
          borderRadius: 5,
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          resize: "vertical",
          minHeight: 120,
        }}
      />

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn"
          type="submit"
          style={{
            background: "var(--primary-color, #1976d2)",
            color: "#fff",
          }}
        >
          Save
        </button>
        <button
          type="button"
          className="btn"
          style={{
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--text-primary)",
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---- NOTE DETAILS COMPONENT ---- */
function NoteDetail({ note, onEdit }) {
  if (!note)
    return (
      <div style={{ color: "#888", textAlign: "center", marginTop: 60 }}>
        Select a note to view details.
      </div>
    );
  return (
    <div className="note-detail" style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ margin: 0 }}>{note.title || <span style={{ color: "#bbb" }}>Untitled</span>}</h2>
        <button
          className="btn"
          style={{
            padding: "0.25rem 0.8rem",
            fontSize: 14,
            background: "var(--accent-color, #ffb300)",
            color: "#222",
            marginLeft: 16,
          }}
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
      <div
        style={{
          marginTop: "1.5rem",
          color: "var(--text-primary)",
          background: "var(--bg-secondary)",
          padding: "1rem",
          borderRadius: 5,
          whiteSpace: "pre-line",
          fontSize: 17,
        }}
      >
        {note.content || <span style={{ color: "#bbb" }}>No content.</span>}
      </div>
      <div style={{ fontSize: 13, color: "#bbb", marginTop: "1rem" }}>
        {note.timestamp
          ? "Last updated: " +
            new Date(note.timestamp).toLocaleString()
          : ""}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // App-level state
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [mainMode, setMainMode] = useState("detail"); // 'detail', 'edit', 'create'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentNote, setCurrentNote] = useState(null);
  const [theme, setTheme] = useState("light");

  // Apply colors (primary/secondary/accent) as CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", "#1976d2");
    document.documentElement.style.setProperty("--secondary-color", "#424242");
    document.documentElement.style.setProperty("--accent-color", "#ffb300");
  }, []);

  // Theme switching
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Load notes when app starts or after CRUD
  useEffect(() => {
    setLoading(true);
    fetchNotes()
      .then((data) => {
        setNotes(data);
        // If none selected, select the first note (if exists)
        if (data.length > 0 && !selectedNoteId) {
          setSelectedNoteId(data[0].id);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to fetch notes.");
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  // Load details when note changes
  useEffect(() => {
    if (!selectedNoteId) {
      setCurrentNote(null);
      setMainMode("detail");
      return;
    }
    setLoading(true);
    fetchNote(selectedNoteId)
      .then((n) => {
        setCurrentNote(n);
        setError("");
        setLoading(false);
        setMainMode("detail");
      })
      .catch((e) => {
        setError("Note not found."); // E.g. after deletion
        setCurrentNote(null);
        setLoading(false);
      });
  }, [selectedNoteId]);

  /* -- Note CRUD Handlers -- */

  // PUBLIC_INTERFACE
  const handleCreateNote = () => {
    setCurrentNote({ title: "", content: "" });
    setMainMode("create");
  };

  // PUBLIC_INTERFACE
  const handleSaveNewNote = async (note) => {
    setLoading(true);
    setError("");
    try {
      const created = await createNote(note);
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);
      setSelectedNoteId(created.id);
      setMainMode("detail");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const handleEditNote = () => {
    setMainMode("edit");
  };

  // PUBLIC_INTERFACE
  const handleSaveEditNote = async (note) => {
    setLoading(true);
    setError("");
    try {
      await updateNote(currentNote.id, note);
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);
      setSelectedNoteId(currentNote.id);
      setMainMode("detail");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setLoading(true);
    setError("");
    try {
      await deleteNote(noteId);
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);
      if (updatedNotes.length > 0) {
        setSelectedNoteId(updatedNotes[0].id);
      } else {
        setSelectedNoteId(null);
        setCurrentNote(null);
      }
      setMainMode("detail");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="App" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Theme Toggle Button */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <div
        className="app-container"
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          transition: "background 0.3s",
        }}
      >
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onCreate={handleCreateNote}
          onDelete={handleDeleteNote}
          theme={theme}
        />

        {/* Main Content */}
        <main
          className="main-content"
          style={{
            flex: 1,
            padding: "0 0 0 0",
            background: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
            maxWidth: "100vw",
            minHeight: "100vh",
          }}
        >
          {/* Branding title bar for mobile */}
          <div
            style={{
              display: "none",
              borderBottom: "1px solid var(--border-color)",
              padding: "1rem",
              fontWeight: "bold",
              color: "var(--primary-color, #1976d2)",
              fontSize: 22,
            }}
            className="brand-title"
          >
            Notes App
          </div>
          <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
            <div style={{ marginTop: 36 }}>
              {loading ? (
                <div style={{ color: "#bbb", textAlign: "center" }}>
                  Loading...
                </div>
              ) : error ? (
                <div
                  style={{
                    color: "#d32f2f",
                    margin: "1.5rem 0",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              ) : mainMode === "create" ? (
                <NoteForm
                  initialNote={{ title: "", content: "" }}
                  onSave={handleSaveNewNote}
                  onCancel={() => setMainMode("detail")}
                />
              ) : mainMode === "edit" ? (
                <NoteForm
                  initialNote={currentNote}
                  onSave={handleSaveEditNote}
                  onCancel={() => setMainMode("detail")}
                />
              ) : (
                <NoteDetail
                  note={currentNote}
                  onEdit={handleEditNote}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      {/* RESPONSIVE STYLES */}
      <style>{`
      .app-container {
        height: 100vh;
      }
      .sidebar {
        width: 270px;
        min-width: 180px;
        max-width: 320px;
        background: var(--bg-secondary);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        transition: width 0.2s;
      }
      .main-content {
        flex: 1;
      }
      .btn {
        border: none;
        border-radius: 6px;
        padding: 0.4rem 1.2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        margin: 0;
        background: var(--primary-color, #1976d2);
        color: #fff;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        box-shadow: 0 1px 5px rgba(70,110,180,0.04);
      }
      .btn:hover, .btn:focus {
        background: var(--accent-color, #ffb300);
        color: #222;
        outline: none;
        box-shadow: 0 4px 12px rgba(70,110,180,0.11);
      }
      .create-btn {
        background: var(--accent-color, #ffb300);
        color: #222;
        margin-left: 1em;
      }
      @media (max-width: 850px) {
        .sidebar {
          width: 70px;
          min-width: 60px;
          max-width: 80px;
        }
        .main-content {
          padding-left: 0;
        }
        .notes-list span {
          display: none;
        }
      }
      @media (max-width: 600px) {
        .app-container {
          flex-direction: column;
        }
        .sidebar {
          flex-direction: row;
          width: 100vw;
          min-width: unset;
          max-width: unset;
          height: 55px;
          min-height: unset;
          border-right: none;
          border-bottom: 1px solid var(--border-color);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10;
          overflow-x: auto;
          align-items: center;
        }
        .main-content {
          padding-top: 60px;
        }
      }
      .notes-list .active {
        background: var(--primary-color, #1976d2);
        color: #fff;
      }
      .sidebar-delete-btn {
        opacity: 0.6;
      }
      .sidebar-delete-btn:hover {
        opacity: 1;
      }
      `}
      </style>
    </div>
  );
}

export default App;
