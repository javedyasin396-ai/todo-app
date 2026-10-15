// The calendar. It shows one month at a time.
// It is CONNECTED to the to-do list: it reads "todos" and changes "selectedDate",
// which both live in script.js

// STEP 1: Grab the HTML elements we need
const monthLabel = document.getElementById("cal-month");
const grid = document.getElementById("cal-grid");
const prevBtn = document.getElementById("cal-prev");
const nextBtn = document.getElementById("cal-next");
const todayBtn = document.getElementById("cal-today");

// STEP 2: Which month are we looking at? Start with this month.
const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth(); // careful: 0 = January, 11 = December

// Make a date "key" like "2026-10-15" (the same format the tasks use)
function dateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0"); // 9 -> "10", 0 -> "01"
  const dd = String(day).padStart(2, "0");
  return year + "-" + mm + "-" + dd;
}

const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

// STEP 3: Draw the month
function renderCalendar() {
  // Show the month name, like "October 2026"
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  monthLabel.textContent = firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  grid.innerHTML = ""; // clear the old days first

  // Empty boxes before day 1, so it lands under the right week day
  // getDay() gives 0 = Sunday, 1 = Monday ...
  for (let i = 0; i < firstOfMonth.getDay(); i++) {
    grid.appendChild(document.createElement("div"));
  }

  // Day 0 of NEXT month = the last day of THIS month. A handy trick!
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(viewYear, viewMonth, day);

    const dayBtn = document.createElement("button");
    dayBtn.className = "cal-day";
    dayBtn.textContent = day;

    if (key === todayKey) dayBtn.classList.add("today");
    if (key === selectedDate) dayBtn.classList.add("selected");

    // How many unfinished tasks are on this day? Show it as a small badge.
    const count = todos.filter(function (todo) {
      return todo.date === key && !todo.done;
    }).length;
    if (count > 0) {
      const badge = document.createElement("span");
      badge.className = "cal-badge";
      badge.textContent = count;
      dayBtn.appendChild(badge);
    }

    // THE CONNECTION! Clicking a day picks it for the to-do list.
    // Clicking the same day again un-picks it.
    dayBtn.addEventListener("click", function () {
      selectedDate = selectedDate === key ? null : key;
      renderTodos(); // redraws the list AND the calendar
    });

    grid.appendChild(dayBtn);
  }
}

// STEP 4: Buttons to change the month
prevBtn.addEventListener("click", function () {
  viewMonth--;
  if (viewMonth < 0) { // went before January -> December of last year
    viewMonth = 11;
    viewYear--;
  }
  renderCalendar();
});

nextBtn.addEventListener("click", function () {
  viewMonth++;
  if (viewMonth > 11) { // went past December -> January of next year
    viewMonth = 0;
    viewYear++;
  }
  renderCalendar();
});

todayBtn.addEventListener("click", function () {
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();
  selectedDate = todayKey;
  renderTodos();
});

// Draw the calendar when the page first opens
renderCalendar();
