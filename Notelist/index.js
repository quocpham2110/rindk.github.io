window.indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

// Check IDB feature
if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB.");
}

// Create needed variables
const list = document.querySelector(".note__list");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const form = document.querySelector(".form");
const submitBtn = document.querySelector(".form__btn");

// Database variable
let db;

window.onload = function () {
  // Request to indexedBD
  let request = window.indexedDB.open("notesDB", 1);

  // On error handler
  request.onerror = function () {
    console.log("Database failed to open.");
    list.innerHTML = "Database failed to open.";
  };

  // On success handler
  request.onsuccess = function () {
    console.log("Database opened successfully.");
    db = request.result;

    // Display notes
    displayNotes();
  };

  //  Upgrade
  request.onupgradeneeded = function (e) {
    let db = e.target.result;

    // Create an objectStore to store all notes, auto-incrementing key
    let objectStore = db.createObjectStore("noteStore", {
      keyPath: "id",
      autoIncrement: true,
    });

    // Define content of objectStore
    objectStore.createIndex("title", "title", { unique: false });
    objectStore.createIndex("content", "content", { unique: false });

    console.log("Database setup complete");
  };

  // Submit note
  form.onsubmit = addNote;

  // Define addNote() func
  function addNote(e) {
    e.preventDefault();

    let newItem = { title: titleInput.value, content: contentInput.value };
    let transaction = db.transaction(["noteStore"], "readwrite");
    let request = transaction.objectStore("noteStore").add(newItem);

    request.onsuccess = function () {
      titleInput.value = "";
      contentInput.value = "";
    };

    transaction.oncomplete = function () {
      console.log("Transaction complete.");
      displayNotes();
    };

    transaction.onerror = function () {
      console.log("Transaction failed.");
    };
  }

  // Define the displayNotes func
  function displayNotes() {
    // Delete all current notes
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    let objectStore = db.transaction("noteStore").objectStore("noteStore");

    objectStore.openCursor().onsuccess = function (e) {
      let cursor = e.target.result;

      if (cursor) {
        const li = document.createElement("li");
        const div = document.createElement("div");
        const h3 = document.createElement("h3");
        const p = document.createElement("p");
        const dltBtn = document.createElement("button");

        // Add elements to list
        div.appendChild(h3);
        div.appendChild(dltBtn);
        li.appendChild(div);
        li.appendChild(p);
        list.appendChild(li);
        // Add content
        h3.textContent = cursor.value.title;
        p.textContent = cursor.value.content;
        dltBtn.textContent = "X";
        // Set attribute
        li.setAttribute("note-id", cursor.value.id);
        li.setAttribute("class", "note__item");
        div.setAttribute("class", "note__store");
        h3.setAttribute("class", "note__heading");
        p.setAttribute("class", "note__content");
        dltBtn.setAttribute("class", "note__dltBtn");

        // Click delete button => active dltNote func
        dltBtn.onclick = dltNote;

        // display the next note
        cursor.continue();
      } else {
        if (!list.firstChild) {
          const li = document.createElement("li");
          li.style.fontSize = "1.3rem";
          li.textContent = "There no note! Please add more.";
          list.appendChild(li);
        }
        console.log("Notes all displayed");
      }
    };
  }

  // Define the dltNote func
  function dltNote(e) {
    let noteId = Number(e.target.parentNode.parentNode.getAttribute("note-id"));

    let request = db
      .transaction(["noteStore"], "readwrite")
      .objectStore("noteStore")
      .delete(noteId);

    request.onsuccess = function () {
      displayNotes();
      
    };
  }
};
