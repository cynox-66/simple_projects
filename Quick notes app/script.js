let notes = [];
let editingNoteId = null;

function loadNotes() {
  const savedNotes = localStorage.getItem("quickNotes");
  // ensure id always stays string upon loading for consistent comparison later
  return savedNotes ? JSON.parse(savedNotes).map(n => ({ ...n, id: String(n.id) })) : [];
}

function saveNote(event) {
  event.preventDefault();

  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();

  if (!title || !content) return;

  // force string id for comparison consistency
  if (editingNoteId) {
    // Finds index of note where the stringified id matches the stringified editingNoteId
    const index = notes.findIndex(n => String(n.id) === String(editingNoteId));
    if (index !== -1) {
      notes[index] = { ...notes[index], title, content };
    }
  } else {
    notes.unshift({
      id: String(Date.now()),   // ensure id always stays string
      title,
      content,
    });
  }

  editingNoteId = null;
  closeNoteDialog();
  saveNotes();
  renderNotes();
}

function saveNotes() {
  localStorage.setItem("quickNotes", JSON.stringify(notes));
}

function deleteNote(noteId) {
  // force string comparison
  notes = notes.filter(note => String(note.id) !== String(noteId));
  saveNotes();
  renderNotes();
}

function renderNotes() {
  const container = document.getElementById("notesContainer");

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No Notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add First Note</button>
      </div>`;
    return;
  }

  container.innerHTML = notes
    .map(note => `
      <div class="note-card">
        <h3 class="note-title">${note.title}</h3>
        <p class="note-content">${note.content}</p>

        <div class="note-actions">
          <button class="edit-btn" onclick="openNoteDialog('${note.id}')">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0L15.13 5.5l3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>

          <button class="delete-btn" onclick="deleteNote('${note.id}')">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89z"/>
            </svg>
          </button>
        </div>
      </div>
    `)
    .join("");
}

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById("noteDialog");
  const titleInput = document.getElementById("noteTitle");
  const contentInput = document.getElementById("noteContent");

  if (noteId) {
    // force string comparison
    const note = notes.find(n => String(n.id) === String(noteId));
    editingNoteId = String(noteId);
    document.getElementById("dialogTitle").textContent = "Edit Note";
    titleInput.value = note.title;
    contentInput.value = note.content;
  } else {
    editingNoteId = null;
    document.getElementById("dialogTitle").textContent = "Add New Note";
    titleInput.value = "";
    contentInput.value = "";
  }

  dialog.showModal();
  titleInput.focus();
}

function closeNoteDialog() {
  document.getElementById("noteDialog").close();
}

/* THEME TOGGLE */
document.getElementById("themeToggleBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  const isDark = document.body.classList.contains("dark-theme");
  document.getElementById("themeToggleBtn").textContent = isDark ? "🌙" : "☀️";
});

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  notes = loadNotes();
  renderNotes();
  
});