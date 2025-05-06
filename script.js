// Task Management System
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let taskToDelete = null;
let isClearAll = false;

// DOM Elements
const taskInput = document.getElementById("taskInput");
const taskHours = document.getElementById("taskHours");
const taskMinutes = document.getElementById("taskMinutes");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const clearAllBtn = document.getElementById("clearAllBtn");
const filterBtns = document.querySelectorAll(".filter-btn");

// Dialog Elements
const confirmDialog = document.getElementById("confirmDialog");
const confirmDialogText = document.getElementById("confirmDialogText");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const confirmCancelBtn = document.getElementById("confirmCancel");

// Error Dialog Elements
const errorDialog = document.getElementById("errorDialog");
const errorDialogText = document.getElementById("errorDialogText");
const errorOkBtn = document.getElementById("errorOk");

// Statistics Elements
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const totalTimeEl = document.getElementById("totalTime");
const progressBar = document.getElementById("progressBar");
const productivityScore = document.getElementById("productivityScore");

// Event Listeners
addTaskBtn.addEventListener("click", addTask);
clearAllBtn.addEventListener("click", () => {
  isClearAll = true;
  showDialog("all tasks");
});
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Dialog Event Listeners
confirmDeleteBtn.addEventListener("click", () => {
  if (isClearAll) {
    tasks = [];
    saveTasks();
    renderTasks();
    updateStatistics();
  } else if (taskToDelete) {
    tasks = tasks.filter((task) => task.id !== taskToDelete);
    saveTasks();
    renderTasks();
    updateStatistics();
  }
  hideDialog();
});

confirmCancelBtn.addEventListener("click", hideDialog);
errorOkBtn.addEventListener("click", hideErrorDialog);

// Show Dialog
function showDialog(taskText) {
  const message = isClearAll ? "Are you sure you want to delete all tasks? This action cannot be undone." : `Are you sure you want to delete the task "${taskText}"?`;
  confirmDialogText.textContent = message;
  confirmDialog.classList.add("active");
}

// Hide Dialog
function hideDialog() {
  confirmDialog.classList.remove("active");
  taskToDelete = null;
  isClearAll = false;
}

// Show Error Dialog
function showErrorDialog(message) {
  errorDialogText.textContent = message;
  errorDialog.classList.add("active");
}

// Hide Error Dialog
function hideErrorDialog() {
  errorDialog.classList.remove("active");
}

// Add Task Function
function addTask() {
  const taskText = taskInput.value.trim();
  const hours = parseInt(taskHours.value) || 0;
  const minutes = parseInt(taskMinutes.value) || 0;

  if (!taskText) {
    showErrorDialog("Task description cannot be empty");
    taskInput.focus();
    return;
  }

  if (taskText.length < 10) {
    showErrorDialog("Task description must be at least 10 characters long");
    taskInput.focus();
    return;
  }

  // Only validate minutes if hours is 0 or blank
  if (hours === 0 && minutes === 0) {
    showErrorDialog("Please enter either hours or minutes greater than 0");
    taskMinutes.focus();
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    hours,
    minutes,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  updateStatistics();
  resetInputs();
}

// Reset Input Fields
function resetInputs() {
  taskInput.value = "";
  taskHours.value = "0";
  taskMinutes.value = "";
  taskInput.focus();
}

// Save Tasks to Local Storage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Toggle Task Completion
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    saveTasks();
    renderTasks();
    updateStatistics();
  }
}

// Delete Task
function deleteTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    isClearAll = false;
    taskToDelete = id;
    showDialog(task.text);
  }
}

// Update Statistics
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const totalTime = tasks.reduce((acc, task) => {
    return acc + (task.hours * 60 + task.minutes);
  }, 0);

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
  totalTimeEl.textContent = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;

  // Update progress bar
  const progress = total === 0 ? 0 : (completed / total) * 100;
  progressBar.style.width = `${progress}%`;

  // Calculate productivity score
  const productivity = total === 0 ? 0 : Math.round((completed / total) * 100);
  productivityScore.textContent = `Productivity: ${productivity}%`;
}

// Render Tasks
function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "pending") return !task.completed;
  });

  // Sort tasks: completed tasks go to bottom
  filteredTasks.sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.innerHTML = `
      <span><i class="far fa-clock"></i> ${task.hours}h ${task.minutes}m</span>
      <span><i class="far fa-calendar"></i> ${new Date(task.createdAt).toLocaleDateString()}</span>
    `;

    taskInfo.appendChild(title);
    taskInfo.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.innerHTML = task.completed ? '<i class="fas fa-undo"></i> Undo' : '<i class="fas fa-check"></i> Complete';
    toggleBtn.onclick = () => toggleTask(task.id);

    // Add toggle button first
    actions.appendChild(toggleBtn);

    // Only show delete button if task is not completed
    if (!task.completed) {
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
      deleteBtn.onclick = () => deleteTask(task.id);
      actions.appendChild(deleteBtn);
    }

    // Add task number
    const taskNumber = document.createElement("div");
    taskNumber.className = "task-number";
    taskNumber.textContent = `#${index + 1}`;

    li.appendChild(taskNumber);
    li.appendChild(taskInfo);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

// Initial Render
renderTasks();
updateStatistics();
