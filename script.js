const settings = {
  min: 0,
  max: 10,
  basePoints: 120,
};

const state = {
  secret: 0,
  low: settings.min,
  high: settings.max,
  attempts: 0,
  score: 0,
  history: [],
  isRoundOver: false,
};

const guessForm = document.querySelector("#guessForm");
const guessInput = document.querySelector("#guessInput");
const newRoundButton = document.querySelector("#newRoundButton");
const hintButton = document.querySelector("#hintButton");
const rangeText = document.querySelector("#rangeText");
const statusText = document.querySelector("#statusText");
const scoreText = document.querySelector("#scoreText");
const attemptsText = document.querySelector("#attemptsText");
const suggestionText = document.querySelector("#suggestionText");
const historyList = document.querySelector("#historyList");
const meterFill = document.querySelector("#meterFill");
const binaryMarks = document.querySelector("#binaryMarks");

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function binaryGuess() {
  return Math.floor((state.low + state.high) / 2);
}

function resetRound() {
  state.secret = randomInteger(settings.min, settings.max);
  state.low = settings.min;
  state.high = settings.max;
  state.attempts = 0;
  state.score = 0;
  state.history = [];
  state.isRoundOver = false;

  guessInput.value = "";
  guessInput.disabled = false;
  guessInput.focus();

  statusText.textContent = "I picked a number. Use the binary hint to shrink the range fast.";
  updateView();
}

function updateView() {
  rangeText.textContent = `${state.low} to ${state.high}`;
  scoreText.textContent = state.score;
  attemptsText.textContent = state.attempts;
  suggestionText.textContent = state.isRoundOver ? "-" : binaryGuess();
  guessInput.min = settings.min;
  guessInput.max = settings.max;

  const activeSpan = state.high - state.low + 1;
  const totalSpan = settings.max - settings.min + 1;
  const rangeWidth = Math.max((activeSpan / totalSpan) * 100, 6);
  meterFill.style.width = `${rangeWidth}%`;

  renderHistory();
  renderBinaryMarks();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (state.history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "Your guesses will appear here.";
    historyList.append(emptyItem);
    return;
  }

  state.history.forEach((entry) => {
    const item = document.createElement("li");
    const guess = document.createElement("span");
    const result = document.createElement("span");

    guess.textContent = `Guess ${entry.value}`;
    result.textContent = entry.result;
    result.className = entry.className;

    item.append(guess, result);
    historyList.prepend(item);
  });
}

function renderBinaryMarks() {
  binaryMarks.innerHTML = "";

  for (let value = settings.min; value <= settings.max; value += 1) {
    const mark = document.createElement("span");
    mark.textContent = value;

    if (value < state.low || value > state.high) {
      mark.className = "discarded";
    }

    if (!state.isRoundOver && value === binaryGuess()) {
      mark.classList.add("suggested");
    }

    binaryMarks.append(mark);
  }
}

function scoreGuess(isCorrect) {
  if (!isCorrect) {
    state.score = Math.max(state.score - 8, 0);
    return;
  }

  const speedBonus = Math.max(60 - state.attempts * 10, 10);
  const rangeBonus = Math.max(30 - (state.high - state.low) * 3, 0);
  state.score += settings.basePoints + speedBonus + rangeBonus;
}

function addHistory(value, result, className) {
  state.history.push({ value, result, className });
}

function makeGuess(value) {
  if (state.isRoundOver) {
    return;
  }

  if (Number.isNaN(value) || value < settings.min || value > settings.max) {
    statusText.textContent = `Pick a whole number from ${settings.min} to ${settings.max}.`;
    return;
  }

  state.attempts += 1;

  if (value === state.secret) {
    scoreGuess(true);
    state.isRoundOver = true;
    guessInput.disabled = true;
    statusText.textContent = `Correct. ${value} was the number. New round when you are ready.`;
    addHistory(value, "correct", "win");
    updateView();
    return;
  }

  if (value < state.secret) {
    state.low = Math.max(state.low, value + 1);
    scoreGuess(false);
    statusText.textContent = `${value} is too low. The secret is higher.`;
    addHistory(value, "too low", "low");
  } else {
    state.high = Math.min(state.high, value - 1);
    scoreGuess(false);
    statusText.textContent = `${value} is too high. The secret is lower.`;
    addHistory(value, "too high", "high");
  }

  updateView();
}

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  makeGuess(Number.parseInt(guessInput.value, 10));
  guessInput.select();
});

hintButton.addEventListener("click", () => {
  if (state.isRoundOver) {
    return;
  }

  guessInput.value = binaryGuess();
  guessInput.focus();
});

newRoundButton.addEventListener("click", resetRound);

resetRound();