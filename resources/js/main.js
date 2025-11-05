// 1. Initialize the Neutralino.js client
Neutralino.init();

// 2. Add an event listener for when the window is closed
function onWindowClose() {
  Neutralino.app.exit();
}
Neutralino.events.on("windowClose", onWindowClose);

// --- Our New Code Starts Here ---

// 3. Get our HTML elements
let noteArea = document.getElementById('note-area');
let saveButton = document.getElementById('save-btn');
let loadButton = document.getElementById('load-btn');
let statusMessage = document.getElementById('status-message');

// 4. Create the CORRECTED function to save notes
async function saveNotes() {
  try {
    let savePath = await Neutralino.os.showSaveDialog(
      'Save Note As...', // Argument 1: title (string)
      {                  // Argument 2: options (object)
        filters: [
          {name: 'Text Files', extensions: ['txt']}
        ]
      }
    );

    // If the user didn't click "Cancel"
    if (savePath) {
      
      // --- THIS IS THE NEW FIX ---
      // Check if the path already ends with .txt
      // If not, add it ourselves!
      if (!savePath.endsWith('.txt')) {
        savePath += '.txt';
      }
      // --- END OF FIX ---

      let content = noteArea.value;
      await Neutralino.filesystem.writeFile(savePath, content);
      
      statusMessage.innerText = "Note saved successfully!";
      statusMessage.style.color = "green";
      // --- ADD THIS LINE ---
      noteArea.value = ''; // Clears the text area

    } else {
      statusMessage.innerText = "Save operation cancelled.";
      statusMessage.style.color = "grey";
    }

  } catch (err) {
    console.error(err);
    statusMessage.innerText = "Error saving note.";
    statusMessage.style.color = "red";
  }
}

// 5. Create the CORRECTED function to load notes
async function loadNotes() {
  try {
    // This is the corrected function call:
    let openResult = await Neutralino.os.showOpenDialog(
      'Open Note...', // Argument 1: title (string)
      {               // Argument 2: options (object)
        filters: [
          {name: 'Text Files', extensions: ['txt']}
        ]
      }
    );

    if (openResult && openResult.length > 0) {
      let openPath = openResult[0];
      let content = await Neutralino.filesystem.readFile(openPath);
      noteArea.value = content;

      statusMessage.innerText = "Note loaded successfully!";
      statusMessage.style.color = "green";
    } else {
      statusMessage.innerText = "Load operation cancelled.";
      statusMessage.style.color = "grey";
    }

  } catch (err) {
    console.error(err);
    statusMessage.innerText = "Error loading note.";
    statusMessage.style.color = "red";
  }
}

// 6. Add click event listeners to our buttons
saveButton.addEventListener('click', saveNotes);
loadButton.addEventListener('click', loadNotes);