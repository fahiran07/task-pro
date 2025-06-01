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

// Add new DOM element for total completion time
const totalCompletionTime = document.getElementById("totalCompletionTime");

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
    tasks = tasks.filter((task) => task.id != taskToDelete);
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
    taskNumber: tasks.length + 1, // Store the original task number
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
  console.log(`Toggling task with ID: ${id}`);

  const task = tasks.find((t) => t.id == id);
  console.log(tasks);

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
  const task = tasks.find((t) => t.id == id);
  if (task) {
    isClearAll = false;
    taskToDelete = id;
    showDialog(task.text);
  }
}

function calculateTimeInfo() {
  const now = new Date();
  let totalRemainingMinutes = 0;
  let completionTime = new Date(now);

  tasks.forEach((task) => {
    if (!task.completed) {
      totalRemainingMinutes += task.hours * 60 + task.minutes;
    }
  });

  completionTime.setMinutes(completionTime.getMinutes() + totalRemainingMinutes);

  // Format to 12-hour time
  const hours = completionTime.getHours();
  const minutes = completionTime.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

  return {
    remainingTime: totalRemainingMinutes,
    completionTime: formattedTime,
  };
}

// Function to format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  totalTimeEl.textContent = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;

  // Calculate and display remaining time and completion time
  const timeInfo = calculateTimeInfo();
  const remainingHours = Math.floor(timeInfo.remainingTime / 60);
  const remainingMinutes = timeInfo.remainingTime % 60;

  if (timeInfo.remainingTime > 0) {
    totalCompletionTime.textContent = `${formatTime(timeInfo.completionTime)} (${remainingHours}h ${remainingMinutes}m)`;
  } else {
    totalCompletionTime.textContent = "Completed!";
  }

  // Update progress bar
  const progress = total === 0 ? 0 : (completed / total) * 100;
  progressBar.style.width = `${progress}%`;
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

  let htmlContent = "";

  filteredTasks.forEach((task) => {
    const remainingTime = task.completed ? "Completed" : `${task.hours}h ${task.minutes}m remaining`;
    const taskClass = task.completed ? "completed" : "";

    htmlContent += `
    <li class="task-item ${taskClass}" style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #333;">
      <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask('${task.id}')" style="width: 18px; height: 18px; cursor: pointer;" />

      <div style="flex: 1;">
        <div class="task-title" style="font-size: 12px; font-weight: 500; color: #fff;">${task.text}</div>
        <div class="task-meta" style="font-size: 12px; color: #aaa; margin-top: 2px;">
          <span><i class="far fa-clock"></i> ${remainingTime}</span>
        </div>
      </div>

      ${
        !task.completed
          ? `<button onclick="deleteTask('${task.id}')" style="background: none; border: none; color: #f44336; cursor: pointer;">
              <i class="fas fa-trash"></i>
            </button>`
          : ""
      }
    </li>
  `;
  });

  // Inject into the task list container
  taskList.innerHTML = htmlContent;
}

// Initial Render
renderTasks();
updateStatistics();
