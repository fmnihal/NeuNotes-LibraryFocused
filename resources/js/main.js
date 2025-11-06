// 1. Initialize the Neutralino.js client
Neutralino.init();

// 2. Add an event listener for when the window is closed
function onWindowClose() {
  Neutralino.app.exit();
}
Neutralino.events.on("windowClose", onWindowClose);

// --- Our New Library-App Code Starts Here ---

// 3. Define the path for our notes directory
const NOTES_DIR = `${NL_PATH}/notes`;

// 4. Get our HTML elements
let noteArea = document.getElementById('note-area');
let saveButton = document.getElementById('save-btn');
let statusMessage = document.getElementById('status-message');
let notesList = document.getElementById('notes-list'); // The <ul>
let filenameInput = document.getElementById('filename-input'); // The <input>
// This new variable will track our app's state
let currentOpenNote = null; // 'null' will mean "a new, unsaved note"

// --- NEW VIEW-MANAGEMENT VARIABLES ---
let libraryView = document.getElementById('library-view');
let editorView = document.getElementById('editor-view');
let newNoteBtn = document.getElementById('new-note-btn');
let backBtn = document.getElementById('back-btn');

// Function to create the notes directory if it doesn't exist
async function setupApp() {
  try {
    await Neutralino.filesystem.createDirectory(NOTES_DIR);
    console.log("Notes directory created.");
  } catch (err) {
    console.log("Notes directory already exists or another error occurred.");
    console.error(err);
  }
}

// Function to read the notes directory and display the files
async function loadNotesList() {
  notesList.innerHTML = ''; 
  
  try {
    let entries = await Neutralino.filesystem.readDirectory(NOTES_DIR);

    for (let entry of entries) {
      if (entry.type === 'FILE' && entry.entry.endsWith('.txt')) {
        let noteItem = document.createElement('li');
        noteItem.innerText = entry.entry; 
        
        noteItem.addEventListener('click', () => {
          // 1. Hide libraryView
          libraryView.style.display = 'none'; 
          // 2. Show editorView
          editorView.style.display = 'block'; 

          // 3. Load the note content
          loadNoteIntoEditor(entry.entry);
        });

        notesList.appendChild(noteItem);
      }
    }
  } catch (err) {
    console.error("Error loading notes list:", err);
  }
}

// Function to save the current note
async function saveNotes() {
  // 1. Get the filename and content
  let filename = filenameInput.value;
  let content = noteArea.value;
  
  let filenameToSave;
  if (currentOpenNote === null) {
    // It's a NEW note.
    filenameToSave = filenameInput.value;
  } else {
    // It's an EXISTING note.
    filenameToSave = currentOpenNote;
  }

  // 2. Basic validation -- THIS FIXES THE NEW NOTE BUG
  if (!filename) {
    statusMessage.innerText = "Please enter a filename.";
    statusMessage.style.color = "red";
    return;
  }
  
  // 3. Make sure it ends with .txt (like we did before)
  if (!filename.endsWith('.txt')) {
    filename += '.txt';
  }

  // 4. Create the full path
  let fullPath = `${NOTES_DIR}/${filename}`;

  // 5. Try to save the file
  try {
    await Neutralino.filesystem.writeFile(fullPath, content);
    
    // Success! Show a message
    statusMessage.innerText = "Note saved successfully!";
    statusMessage.style.color = "green";

    // THIS IS NEW: Make the input read-only AFTER a successful save
    filenameInput.readOnly = true;

    // IMPORTANT: Reload the list in the sidebar
    await loadNotesList();

  } catch (err) {
    console.error("Error saving note:", err);
    statusMessage.innerText = "Error saving note.";
    statusMessage.style.color = "red";
  }
}

// Function to load a specific note into the editor
async function loadNoteIntoEditor(filename) {
  try {
    // Set the current note state right away
    currentOpenNote = filename; // <-- Added this line
    
    // 1. Create the full path to the note
    let fullPath = `${NOTES_DIR}/${filename}`;
    
    // 2. Read the file content
    let content = await Neutralino.filesystem.readFile(fullPath);
    
    // 3. Put the content and filename into the UI
    noteArea.value = content;
    filenameInput.value = filename;

    // THIS IS NEW: Make the input read-only
    filenameInput.readOnly = true;
    filenameInput.classList.add('filename-readonly');

    statusMessage.innerText = `Loaded ${filename}`;
    statusMessage.style.color = "blue";

  } catch (err) {
    console.error("Error loading note:", err);
    statusMessage.innerText = "Error loading note.";
    statusMessage.style.color = "red";
  }
}

// --- ALL OUR EVENT LISTENERS ---

// Call setup functions when the app is ready
Neutralino.events.on("ready", async () => {
  await setupApp();
  await loadNotesList();
});

// Attach save button listener
saveButton.addEventListener('click', saveNotes);

newNoteBtn.addEventListener('click', () => {
  libraryView.style.display = 'none'; 
  editorView.style.display = 'block'; 
  
  noteArea.value = '';
  filenameInput.value = '';
  
  filenameInput.readOnly = false;
  filenameInput.classList.remove('filename-readonly');
  
  statusMessage.innerText = '';

  currentOpenNote = null; // <-- Added this line
});

// Back button listener
backBtn.addEventListener('click', () => {
  // 1. Show library, hide editor
  libraryView.style.display = 'block'; 
  editorView.style.display = 'none'; 
});

// Show save button when user starts typing
noteArea.addEventListener('input', () => {
  saveButton.style.display = 'block';
});