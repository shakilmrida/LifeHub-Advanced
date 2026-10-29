/* ==========================================
   LIFEHUB — COMPLETE JAVASCRIPT
   Theme, Tasks, Filters, Timer and Notes
========================================== */

/* ==========================================
   1. SELECT HTML ELEMENTS
========================================== */

const themeBtn = document.getElementById("themeBtn");
const welcomeBtn = document.getElementById("welcomeBtn");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyMessage = document.getElementById("emptyMessage");

const filterButtons = document.querySelectorAll(".filter-btn");

const timerDisplay = document.getElementById("timerDisplay");
const timerRing = document.querySelector(".timer-ring");
const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");

const focusTimerBtn = document.getElementById("focusTimerBtn");
const shortBreakBtn = document.getElementById("shortBreak");
const longBreakBtn = document.getElementById("longBreak");
const timerStatus = document.getElementById("timerStatus");

const noteTitleInput = document.getElementById("noteTitle");
const noteContentInput = document.getElementById("noteContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const notesList = document.getElementById("notesList");
const notesStatus = document.getElementById("notesStatus");

/* ==========================================
   2. DARK AND LIGHT THEME
========================================== */

const THEME_STORAGE_KEY = "lifeHubTheme";

function applyTheme(theme) {
  const isLight = theme === "light";

  document.body.classList.toggle("light-mode", isLight);

  if (themeBtn) {
    themeBtn.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";

    themeBtn.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme",
    );
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Theme preference could not be saved.", error);
  }
}

// Restore the saved theme when the page opens.
let savedTheme = "dark";

try {
  savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
} catch (error) {
  console.warn("Could not load saved theme.", error);
}

applyTheme(savedTheme === "light" ? "light" : "dark");

if (themeBtn) {
  themeBtn.addEventListener("click", function () {
    const isLight = document.body.classList.contains("light-mode");

    applyTheme(isLight ? "dark" : "light");
  });
}

/* ==========================================
   3. GET STARTED BUTTON
========================================== */

if (welcomeBtn) {
  welcomeBtn.addEventListener("click", function () {
    const featureSection = document.querySelector(".features");

    if (featureSection) {
      featureSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    welcomeBtn.textContent = "Let's Do This! ✔";
  });
}

/* ==========================================
   4. FEATURE CARD INTERACTION
========================================== */

const featureCards = document.querySelectorAll(".feature-card");

const featureTargets = ["tasks", "quick-notes", "focus"];

featureCards.forEach(function (card, index) {
  card.addEventListener("click", function (event) {
    // Let a real link inside the card work normally.
    if (event.target.closest("a, button")) {
      return;
    }

    const targetId = featureTargets[index];
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

/* ==========================================
   5. LOAD SAVED TASKS
========================================== */

let tasks = [];
let currentFilter = "all";

try {
  const savedTasks = JSON.parse(localStorage.getItem("lifehubTasks") || "[]");

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(function (task) {
      return (
        task &&
        (typeof task.id === "number" || typeof task.id === "string") &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
      );
    });
  }
} catch (error) {
  console.error("Could not load saved tasks:", error);
}

/* ==========================================
   6. UPDATE TASK PROGRESS
========================================== */

function updateTaskProgress() {
  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");
  const progressDetails = document.getElementById("progressDetails");

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(function (task) {
    return task.completed;
  }).length;

  const percentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  if (progressText) {
    progressText.textContent = percentage + "% completed";
  }

  if (progressFill) {
    progressFill.style.width = percentage + "%";
    progressFill.setAttribute("aria-valuenow", String(percentage));
  }

  if (progressDetails) {
    progressDetails.textContent =
      completedTasks + " of " + totalTasks + " tasks completed";
  }
}

/* ==========================================
   7. DISPLAY AND FILTER TASKS
========================================== */

function renderTasks() {
  if (!taskList) {
    updateTaskProgress();
    return;
  }

  taskList.replaceChildren();

  let filteredTasks = tasks;

  if (currentFilter === "pending") {
    filteredTasks = tasks.filter(function (task) {
      return !task.completed;
    });
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter(function (task) {
      return task.completed;
    });
  }

  filteredTasks.forEach(function (task) {
    const li = document.createElement("li");

    li.className = "task-item";
    li.dataset.taskId = String(task.id);

    if (task.completed) {
      li.classList.add("completed");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    const span = document.createElement("span");

    span.className = "task-text";
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");

    deleteBtn.type = "button";
    deleteBtn.className = "delete-task";
    deleteBtn.textContent = "🗑️";
    deleteBtn.setAttribute("aria-label", "Delete task");

    li.append(checkbox, span, deleteBtn);
    taskList.appendChild(li);
  });

  if (taskCount) {
    taskCount.textContent =
      filteredTasks.length + (filteredTasks.length === 1 ? " task" : " tasks");
  }

  if (emptyMessage) {
    emptyMessage.style.display = filteredTasks.length === 0 ? "block" : "none";

    emptyMessage.textContent =
      currentFilter === "completed"
        ? "No completed tasks yet."
        : currentFilter === "pending"
          ? "No pending tasks."
          : "No tasks yet. Add your first task!";
  }

  updateTaskProgress();
}

/* ==========================================
   8. SAVE TASKS
========================================== */

function saveTasks() {
  try {
    localStorage.setItem("lifehubTasks", JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    return false;
  }
}

/* ==========================================
   9. ADD A NEW TASK
========================================== */

if (taskForm && taskInput) {
  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (!taskText) {
      taskInput.focus();
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };

    // New tasks always appear at the top.
    tasks.unshift(newTask);

    if (!saveTasks()) {
      tasks.shift();
      alert("Could not save the task. Check your browser storage.");
      return;
    }

    currentFilter = "all";

    filterButtons.forEach(function (button) {
      button.classList.toggle("active", button.dataset.filter === "all");
    });

    renderTasks();

    taskInput.value = "";
    taskInput.focus();
  });
}

/* ==========================================
   10. COMPLETE OR UNCOMPLETE A TASK
========================================== */

if (taskList) {
  taskList.addEventListener("change", function (event) {
    if (!event.target.matches(".task-checkbox")) {
      return;
    }

    const li = event.target.closest(".task-item");

    if (!li) {
      return;
    }

    const task = tasks.find(function (item) {
      return String(item.id) === li.dataset.taskId;
    });

    if (!task) {
      return;
    }

    const previousValue = task.completed;
    task.completed = event.target.checked;

    if (!saveTasks()) {
      task.completed = previousValue;
      renderTasks();
      alert("Could not save the task change.");
      return;
    }

    renderTasks();
  });
}

/* ==========================================
   11. DELETE A TASK
========================================== */

if (taskList) {
  taskList.addEventListener("click", function (event) {
    const deleteBtn = event.target.closest(".delete-task");

    if (!deleteBtn) {
      return;
    }

    const li = deleteBtn.closest(".task-item");

    if (!li) {
      return;
    }

    const taskId = li.dataset.taskId;

    const previousTasks = tasks;

    tasks = tasks.filter(function (task) {
      return String(task.id) !== taskId;
    });

    if (!saveTasks()) {
      tasks = previousTasks;
      alert("Could not delete the task. Please try again.");
      return;
    }

    renderTasks();
  });
}

/* ==========================================
   12. TASK FILTERS
========================================== */

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const requestedFilter = button.dataset.filter;

    if (!["all", "pending", "completed"].includes(requestedFilter)) {
      return;
    }

    currentFilter = requestedFilter;

    filterButtons.forEach(function (filterButton) {
      const isActive = filterButton === button;

      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

/* ==========================================
   13. FOCUS TIMER
========================================== */

let timerSeconds = 25 * 60;
let selectedMinutes = 25;
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  const timeText =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

  if (timerDisplay) {
    timerDisplay.textContent = timeText;
  }
  // Update ring progress according to remaining time.
  if (timerRing && selectedMinutes > 0) {
    const totalSeconds = selectedMinutes * 60;
    const progress = Math.max(
      0,
      Math.min(100, (timerSeconds / totalSeconds) * 100),
    );

    timerRing.style.setProperty("--timer-progress", progress + "%");
  }
  document.title = timeText + " | LifeHub";
}

function stopTimerInterval() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateActivePreset(selectedButton) {
  document
    .querySelectorAll(
      ".timer-preset, .preset-btn, #focusTimerBtn, #shortBreak, #longBreak",
    )
    .forEach(function (button) {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });

  if (selectedButton) {
    selectedButton.classList.add("active");
    selectedButton.setAttribute("aria-pressed", "true");
  }
}

function setTimer(minutes, message, selectedButton) {
  stopTimerInterval();

  selectedMinutes = minutes;
  timerSeconds = minutes * 60;

  updateTimerDisplay();
  updateActivePreset(selectedButton);

  if (timerStatus) {
    timerStatus.textContent = message;
  }
}

function startTimer() {
  if (timerInterval !== null) {
    return;
  }

  if (timerSeconds <= 0) {
    timerSeconds = selectedMinutes * 60;
    updateTimerDisplay();
  }

  if (timerStatus) {
    timerStatus.textContent =
      selectedMinutes === 25
        ? "Focus session started! 🔥"
        : "Break session started! ☕";
  }

  timerInterval = setInterval(function () {
    timerSeconds--;

    updateTimerDisplay();

    if (timerSeconds <= 0) {
      stopTimerInterval();

      timerSeconds = 0;
      updateTimerDisplay();

      if (timerStatus) {
        timerStatus.textContent = "Time's up! 🎉";
      }

      document.title = "LifeHub";

      playTimerSound();

      alert(
        selectedMinutes === 25
          ? "Focus complete! 🎉 Time to take a break ☕"
          : "Break complete! 🎉 Time to focus again 🔥",
      );
    }
  }, 1000);
}

if (startTimerBtn) {
  startTimerBtn.addEventListener("click", startTimer);
}

if (pauseTimerBtn) {
  pauseTimerBtn.addEventListener("click", function () {
    if (timerInterval === null) {
      return;
    }

    stopTimerInterval();

    if (timerStatus) {
      timerStatus.textContent = "Timer paused ⏸️";
    }
  });
}

if (resetTimerBtn) {
  resetTimerBtn.addEventListener("click", function () {
    stopTimerInterval();

    timerSeconds = selectedMinutes * 60;

    updateTimerDisplay();

    if (timerStatus) {
      timerStatus.textContent = "Timer reset! Ready to go 🚀";
    }
  });
}

if (focusTimerBtn) {
  focusTimerBtn.addEventListener("click", function () {
    setTimer(25, "Ready to focus? 🚀", focusTimerBtn);
  });
}

if (shortBreakBtn) {
  shortBreakBtn.addEventListener("click", function () {
    setTimer(5, "☕ Short break. Relax a little!", shortBreakBtn);
  });
}

if (longBreakBtn) {
  longBreakBtn.addEventListener("click", function () {
    setTimer(15, "🌿 Long break. Recharge yourself!", longBreakBtn);
  });
}

updateTimerDisplay();

if (focusTimerBtn) {
  updateActivePreset(focusTimerBtn);
}

/* ==========================================
   14. TIMER SOUND NOTIFICATION
========================================== */

function playTimerSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {
    const audioContext = new AudioContextClass();

    function playBeep(startTime) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = 880;

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const now = audioContext.currentTime;

    playBeep(now);
    playBeep(now + 0.4);
    playBeep(now + 0.8);

    setTimeout(function () {
      audioContext.close().catch(function () {});
    }, 1500);
  } catch (error) {
    console.warn("Timer sound could not play:", error);
  }
}
/* Focus Timer - Dynamic Mode Label */
const timerModeLabel = document.getElementById("timerModeLabel");

function updateTimerModeLabel(mode) {
  if (!timerModeLabel) return;

  const modeLabels = {
    focusTimerBtn: "FOCUS SESSION",
    shortBreak: "SHORT BREAK",
    longBreak: "LONG BREAK",
  };

  timerModeLabel.textContent = modeLabels[mode] || "FOCUS SESSION";
}

document.getElementById("focusTimerBtn")?.addEventListener("click", () => {
  updateTimerModeLabel("focusTimerBtn");
});

document.getElementById("shortBreak")?.addEventListener("click", () => {
  updateTimerModeLabel("shortBreak");
});

document.getElementById("longBreak")?.addEventListener("click", () => {
  updateTimerModeLabel("longBreak");
});

/* ==========================================
   15. QUICK NOTES
========================================== */

const NOTES_STORAGE_KEY = "lifeHubQuickNotes";

let quickNotes = [];

try {
  const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];

  if (Array.isArray(parsedNotes)) {
    quickNotes = parsedNotes.filter(function (note) {
      return (
        note &&
        (typeof note.id === "string" || typeof note.id === "number") &&
        typeof note.title === "string" &&
        typeof note.content === "string"
      );
    });
  }
} catch (error) {
  console.error("Could not load Quick Notes:", error);
}

function saveNotesToStorage() {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(quickNotes));

    return true;
  } catch (error) {
    console.error("Could not save Quick Notes:", error);

    if (notesStatus) {
      notesStatus.textContent =
        "Could not save notes. Check your browser storage.";
    }

    return false;
  }
}

function renderQuickNotes() {
  if (!notesList) {
    return;
  }

  notesList.replaceChildren();

  if (quickNotes.length === 0) {
    const emptyNote = document.createElement("p");

    emptyNote.className = "notes-empty";
    emptyNote.textContent = "No notes yet. Write your first note!";

    notesList.appendChild(emptyNote);
    return;
  }

  quickNotes.forEach(function (note) {
    const noteItem = document.createElement("article");

    // Keep both class names so the existing CSS can style notes.
    noteItem.className = "note-item note-card";

    const title = document.createElement("h3");

    title.textContent = note.title;

    const content = document.createElement("p");

    content.textContent = note.content;

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-note-btn";
    deleteButton.textContent = "🗑️ Delete";
    deleteButton.setAttribute("aria-label", "Delete note");

    deleteButton.addEventListener("click", function () {
      const previousNotes = quickNotes;

      quickNotes = quickNotes.filter(function (item) {
        return item.id !== note.id;
      });

      if (!saveNotesToStorage()) {
        quickNotes = previousNotes;
        return;
      }

      renderQuickNotes();

      if (notesStatus) {
        notesStatus.textContent = "Note deleted successfully!";
      }
    });

    noteItem.append(title, content, deleteButton);
    notesList.appendChild(noteItem);
  });
}

if (saveNoteBtn && noteTitleInput && noteContentInput) {
  saveNoteBtn.addEventListener("click", function () {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title && !content) {
      if (notesStatus) {
        notesStatus.textContent = "Please write a title or note first.";
      }

      return;
    }

    const note = {
      id: Date.now().toString() + "-" + Math.random().toString(36).slice(2),

      title: title || "Untitled Note",
      content: content || "(No note content)",
      createdAt: new Date().toISOString(),
    };

    quickNotes.unshift(note);

    if (!saveNotesToStorage()) {
      quickNotes.shift();
      return;
    }

    renderQuickNotes();

    noteTitleInput.value = "";
    noteContentInput.value = "";

    if (notesStatus) {
      notesStatus.textContent = "Note saved successfully! ✅";
    }
  });
}

/* ==========================================
   16. START LIFEHUB
========================================== */

renderTasks();
renderQuickNotes();
/* Home Button - Scroll to Top */
document
  .querySelectorAll('a[href="#home"], #homeBtn')
  .forEach(function (homeBtn) {
    homeBtn.addEventListener("click", function (event) {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });

/* ==========================================
   17. SIDEBAR MENU TOGGLE
========================================== */

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

if (sidebar && menuToggle) {
  menuToggle.addEventListener("click", function () {
    const isOpen = sidebar.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });
}

console.log("LifeHub is ready! ✨");
