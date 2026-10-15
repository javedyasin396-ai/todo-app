// The reminder clock. It shows the time, and every second it checks
// the to-do list (from script.js) for reminders that are due.

// STEP 1: Grab the HTML elements we need
const clockTime = document.getElementById("clock-time");
const clockDate = document.getElementById("clock-date");
const alarmBox = document.getElementById("alarm-box");
const nextReminder = document.getElementById("next-reminder");
const notifyBtn = document.getElementById("enable-notify");

// Reminders that are ringing right now (they wait here until you click a button)
let ringing = [];

// When is this task's reminder? Gives a Date, or null if it has none.
function reminderTime(todo) {
  if (!todo.time || !todo.date) {
    return null;
  }
  return new Date(todo.date + "T" + todo.time);
}

// STEP 2: Make a "beep beep beep" sound, without needing a sound file
function beep() {
  try {
    const audio = new AudioContext();
    for (let i = 0; i < 3; i++) {
      const sound = audio.createOscillator(); // makes a tone
      sound.frequency.value = 880;            // how high the tone is
      sound.connect(audio.destination);       // send it to the speakers
      sound.start(audio.currentTime + i * 0.4);
      sound.stop(audio.currentTime + i * 0.4 + 0.2);
    }
  } catch (error) {
    // Some browsers block sound until you click the page once. That's OK.
  }
}

// STEP 3: Ring a reminder
function ring(todo) {
  todo.reminded = true; // so it only rings once
  saveTodos();
  renderTodos();

  ringing.push(todo);
  renderAlarms();
  beep();

  // Also show a pop-up from the computer, if you allowed it
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Reminder", { body: todo.text });
  }
}

// Draw the ringing reminders, each with 3 buttons
function renderAlarms() {
  alarmBox.innerHTML = "";
  alarmBox.hidden = ringing.length === 0;

  ringing.forEach(function (todo) {
    const row = document.createElement("div");
    row.className = "alarm";

    const text = document.createElement("strong");
    text.textContent = "⏰ " + todo.text;
    row.appendChild(text);

    // "Done": tick the task off in the to-do list
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✔ Done";
    doneBtn.addEventListener("click", function () {
      todo.done = true;
      stopRinging(todo);
    });

    // "Snooze": ring again in 5 minutes
    const snoozeBtn = document.createElement("button");
    snoozeBtn.textContent = "💤 5 min";
    snoozeBtn.addEventListener("click", function () {
      const later = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in milliseconds
      todo.date = dateKey(later.getFullYear(), later.getMonth(), later.getDate()); // from calendar.js
      todo.time = String(later.getHours()).padStart(2, "0") + ":" + String(later.getMinutes()).padStart(2, "0");
      todo.reminded = false; // so it can ring again
      stopRinging(todo);
    });

    // "Dismiss": just stop ringing
    const dismissBtn = document.createElement("button");
    dismissBtn.textContent = "✕";
    dismissBtn.addEventListener("click", function () {
      stopRinging(todo);
    });

    row.appendChild(doneBtn);
    row.appendChild(snoozeBtn);
    row.appendChild(dismissBtn);
    alarmBox.appendChild(row);
  });
}

// Take a reminder off the ringing list and save any changes
function stopRinging(todo) {
  ringing = ringing.filter(function (item) {
    return item !== todo;
  });
  saveTodos();
  renderTodos();
  renderAlarms();
}

// STEP 4: This runs every second
function tick() {
  const now = new Date();

  // Update the big clock
  clockTime.textContent = now.toLocaleTimeString();
  clockDate.textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  // THE CONNECTION! Look through the to-do list for reminders that are due
  let next = null; // the soonest reminder that hasn't rung yet
  todos.forEach(function (todo) {
    const when = reminderTime(todo);
    if (when === null || todo.done || todo.reminded) {
      return; // skip: no reminder, already done, or already rang
    }
    if (when <= now) {
      ring(todo); // it's time! (also catches reminders missed while the page was closed)
    } else if (next === null || when < reminderTime(next)) {
      next = todo;
    }
  });

  // Show what's coming up next
  if (next === null) {
    nextReminder.textContent = "No reminders coming up.";
  } else {
    nextReminder.textContent = "Next: " + next.text + " — " + formatDate(next.date) + ", " + formatTime(next.time);
  }
}

// STEP 5: The notifications button asks the browser for permission
notifyBtn.addEventListener("click", function () {
  if (!("Notification" in window)) {
    alert("Sorry, this browser can't show notifications.");
    return;
  }
  Notification.requestPermission().then(updateNotifyButton);
});

function updateNotifyButton() {
  if ("Notification" in window && Notification.permission === "granted") {
    notifyBtn.textContent = "🔔 Notifications are on";
    notifyBtn.disabled = true;
  }
}

// Start the clock: run tick() now, then again every 1000 milliseconds (1 second)
updateNotifyButton();
tick();
setInterval(tick, 1000);
