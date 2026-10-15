// The calculator. It works like a simple pocket calculator:
// type a number, pick an operator (+ − × ÷), type another number, press =

// STEP 1: Grab the HTML elements we need
const display = document.getElementById("calc-display");
const history = document.getElementById("calc-history");
const buttons = document.querySelectorAll(".calc-btn");
const toTodoBtn = document.getElementById("calc-to-todo");

// STEP 2: The calculator's memory
let current = "0";        // the number you are typing right now (as text)
let previous = null;      // the first number, saved when you press an operator
let operator = null;      // "+", "-", "*" or "/"
let lastCalculation = ""; // e.g. "12 × 3 = 36", used for the to-do list
let startNewNumber = false; // true right after = or an operator

// Pretty symbols to show on screen instead of * and /
const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// Do the actual math for two numbers
function calculate(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? "Error" : a / b; // can't divide by zero!
}

// Round away tiny errors like 0.1 + 0.2 = 0.30000000000000004
function tidy(number) {
  if (number === "Error") return "Error";
  return String(parseFloat(number.toFixed(10)));
}

// Draw the calculator screen
function updateScreen() {
  display.textContent = current;
  if (operator !== null) {
    history.textContent = previous + " " + symbols[operator];
  } else {
    history.textContent = lastCalculation;
  }
}

// STEP 3: What happens when a button is pressed
function press(value) {
  // If the last answer was an error, start fresh
  if (current === "Error") {
    current = "0";
  }

  if (value >= "0" && value <= "9") {
    // A digit: add it to the current number
    if (current === "0" || startNewNumber) {
      if (operator === null) lastCalculation = ""; // starting a brand new sum
      current = value;
      startNewNumber = false;
    } else {
      current = current + value;
    }
  } else if (value === ".") {
    // A decimal point: only one allowed per number
    if (startNewNumber) {
      if (operator === null) lastCalculation = "";
      current = "0.";
      startNewNumber = false;
    } else if (!current.includes(".")) {
      current = current + ".";
    }
  } else if (value === "C") {
    // Clear everything
    current = "0";
    previous = null;
    operator = null;
    lastCalculation = "";
  } else if (value === "back") {
    // Delete the last digit
    current = current.length > 1 ? current.slice(0, -1) : "0";
  } else if (value === "%") {
    // Turn the number into a percent (50 -> 0.5)
    current = tidy(parseFloat(current) / 100);
  } else if (symbols[value]) {
    // An operator: if we already have one waiting, finish that first (2 + 3 + ...)
    if (operator !== null && !startNewNumber) {
      current = tidy(calculate(parseFloat(previous), parseFloat(current), operator));
    }
    previous = current;
    operator = value;
    lastCalculation = "";
    startNewNumber = true;
  } else if (value === "=") {
    // Equals: work out the answer
    if (operator === null) {
      return; // nothing to calculate yet
    }
    const result = tidy(calculate(parseFloat(previous), parseFloat(current), operator));
    lastCalculation = previous + " " + symbols[operator] + " " + current + " = " + result;
    current = result;
    previous = null;
    operator = null;
    startNewNumber = true;
  }

  updateScreen();
}

// Connect every button to the press() function
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    press(button.dataset.value); // the button's data-value from the HTML
  });
});

// Bonus: you can also use your keyboard (but not while typing a task!)
document.addEventListener("keydown", function (event) {
  if (event.target.tagName === "INPUT") {
    return;
  }
  const keys = { Enter: "=", Escape: "C", Backspace: "back" };
  const value = keys[event.key] || event.key;
  if ("0123456789.%+-*/=".includes(value) || value === "C" || value === "back") {
    event.preventDefault();
    press(value);
  }
});

// STEP 4: THE CONNECTION! Send the calculation to the to-do list
toTodoBtn.addEventListener("click", function () {
  if (current === "Error") {
    return;
  }
  // Use the full calculation if we just pressed =, otherwise just the number
  const text = lastCalculation !== "" ? lastCalculation : current;
  addTodo("🧮 " + text); // addTodo() lives in script.js
});

// Show "0" when the page first opens
updateScreen();
