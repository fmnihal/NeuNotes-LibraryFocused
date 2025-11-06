// 1. Initialize the Neutralino.js client
Neutralino.init();

// 2. Add an event listener for when the window is closed
function onWindowClose() {
  Neutralino.app.exit();
}
Neutralino.events.on("windowClose", onWindowClose);

// --- Our New Library-App Code Starts Here ---

// 3. Define the path for our notes directory
// NL_PATH is the app's root data directory
const NOTES_DIR = `${NL_PATH}/notes`;

// 4. Get our HTML elements
let noteArea = document.getElementById('note-area');
let saveButton = document.getElementById('save-btn');
let statusMessage = document.getElementById('status-message');
let notesList = document.getElementById('notes-list'); // The <ul>
let filenameInput = document.getElementById('filename-input'); // The <input>
let noteItem = document.createElement('li');

// --- Functions will go here ---
// Function to create the notes directory if it doesn't exist
async function setupApp() {
  try {
    // This command will create the folder.
    // If the folder already exists, it will throw an error.
    await Neutralino.filesystem.createDirectory(NOTES_DIR);
    console.log("Notes directory created.");
  } catch (err) {
    // We expect an error if the directory already exists, so we can ignore it.
    console.log("Notes directory already exists or another error occurred.");
    console.error(err);
  }
}

// Function to read the notes directory and display the files
async function loadNotesList() {
  // Clear the list first to avoid duplicates
  notesList.innerHTML = ''; 
  
  try {
    let entries = await Neutralino.filesystem.readDirectory(NOTES_DIR);

    for (let entry of entries) {
      if (entry.type === 'FILE' && entry.entry.endsWith('.txt')) {
        let noteItem = document.createElement('li');
        noteItem.innerText = entry.entry; // This is the filename
        
        // --- THIS IS THE NEW PART ---
        // Add a click event listener to the list item
        noteItem.addEventListener('click', () => {
          loadNoteIntoEditor(entry.entry);
        });
        // --- END OF NEW PART ---

        notesList.appendChild(noteItem);
      }
    }
  } catch (err) {
    console.error("Error loading notes list:", err);
  }
}

// --- Now, we need to CALL these functions when the app launches ---

// We'll run them right after Neutralino.init()
Neutralino.events.on("ready", async () => {
  await setupApp();
  await loadNotesList();
});


// Function to save the current note
async function saveNotes() {
  // 1. Get the filename and content
  let filename = filenameInput.value;
  let content = noteArea.value;

  // 2. Basic validation
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
    
    // Success! Show a message and clear the inputs
    statusMessage.innerText = "Note saved successfully!";
    statusMessage.style.color = "green";
    noteArea.value = '';
    filenameInput.value = '';

    // IMPORTANT: Reload the list in the sidebar
    await loadNotesList();

  } catch (err) {
    console.error("Error saving note:", err);
    statusMessage.innerText = "Error saving note.";
    statusMessage.style.color = "red";
  }
}

// --- And, we need to attach this to the save button ---
saveButton.addEventListener('click', saveNotes);


// Function to load a specific note into the editor
async function loadNoteIntoEditor(filename) {
  try {
    // 1. Create the full path to the note
    let fullPath = `${NOTES_DIR}/${filename}`;
    
    // 2. Read the file content
    let content = await Neutralino.filesystem.readFile(fullPath);
    
    // 3. Put the content and filename into the UI
    noteArea.value = content;
    filenameInput.value = filename;

    statusMessage.innerText = `Loaded ${filename}`;
    statusMessage.style.color = "blue";

  } catch (err) {
    console.error("Error loading note:", err);
    statusMessage.innerText = "Error loading note.";
    statusMessage.style.color = "red";
  }
}