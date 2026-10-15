// JavaScript makes the page DO things (react to clicks, add tasks, etc.)

// STEP 1: Grab the HTML elements we need, using their id
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const counter = document.getElementById("counter");
const filterLabel = document.getElementById("filter-label");
const filterText = document.getElementById("filter-text");
const showAllBtn = document.getElementById("show-all");

// The day picked in the calendar, like "2026-10-15" (null = show all tasks)
// calendar.js changes this when you click a day
let selectedDate = null;

// Turn "2026-10-15" into something friendly like "Thu, Oct 15"
function formatDate(key) {
  const date = new Date(key + "T00:00"); // T00:00 = midnight, in your time zone
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// STEP 2: Load saved tasks from the browser's storage (or start with an empty list)
// Each task is an object like: { text: "Buy milk", done: false }
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Save the tasks into the browser, so they stay after you refresh the page
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// STEP 3: Draw (render) all tasks on the screen
function renderTodos() {
  list.innerHTML = ""; // clear the old list first

  // Loop over every task. "index" is its position: 0, 1, 2...
  todos.forEach(function (todo, index) {
    // If a day is picked in the calendar, skip tasks from other days
    if (selectedDate !== null && todo.date !== selectedDate) {
      return;
    }

    const li = document.createElement("li");
    if (todo.done) {
      li.classList.add("done"); // CSS will cross it out
    }

    // A checkbox to mark the task done / not done
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", function () {
      todos[index].done = !todos[index].done; // flip true <-> false
      saveTodos();
      renderTodos();
    });

    // The task text
    const span = document.createElement("span");
    span.textContent = todo.text;

    // The delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", function () {
      todos.splice(index, 1); // remove 1 item at this position
      saveTodos();
      renderTodos();
    });

    // Put the pieces inside the <li>, then the <li> inside the <ul>
    li.appendChild(checkbox);
    li.appendChild(span);

    // A small date tag, if the task has a date
    if (todo.date) {
      const dateTag = document.createElement("small");
      dateTag.className = "date-tag";
      dateTag.textContent = "📅 " + formatDate(todo.date);
      li.appendChild(dateTag);
    }

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  // Count tasks that are NOT done (only the ones we are showing)
  const remaining = todos.filter(function (todo) {
    const visible = selectedDate === null || todo.date === selectedDate;
    return visible && !todo.done;
  }).length;
  counter.textContent = remaining + " task(s) left";

  // Show which day we're looking at (or hide the label when showing all)
  if (selectedDate === null) {
    filterLabel.hidden = true;
  } else {
    filterLabel.hidden = false;
    filterText.textContent = "📅 Tasks for " + formatDate(selectedDate);
  }

  // Redraw the calendar too, so its task counts stay up to date.
  // (The check is needed because calendar.js loads after this file.)
  if (typeof renderCalendar === "function") {
    renderCalendar();
  }
}

// "Show all" button: un-pick the day
showAllBtn.addEventListener("click", function () {
  selectedDate = null;
  renderTodos();
});

// Add a new task to the list. The calculator (calculator.js) uses this too!
function addTodo(text) {
  text = text.trim(); // .trim() removes extra spaces
  if (text === "") {
    return; // don't add empty tasks
  }

  // If a day is picked in the calendar, the new task gets that date
  todos.push({ text: text, done: false, date: selectedDate }); // add to the end of the array
  saveTodos();
  renderTodos();
}

// STEP 4: When the form is submitted (Add button or Enter key), add a new task
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  addTodo(input.value);
  input.value = ""; // clear the text box
});

// STEP 5: Show the tasks when the page first opens
renderTodos();
