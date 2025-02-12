const taskInput = document.getElementById("taskInput");
const taskDuration = document.getElementById("taskDuration");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const totalTime = document.getElementById("totalTime");
const completionTime = document.getElementById("completionTime");
const clearAllBtn = document.getElementById("clearAllBtn"); // Clear All Button

// Load tasks from localStorage when the page loads
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
	localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
	const taskName = taskInput.value.trim();
	const duration = parseFloat(taskDuration.value);

	if (taskName && !isNaN(duration) && duration > 0) {
		const task = {
			name: taskName,
			duration: duration,
			completed: false,
		};
		tasks.push(task);
		saveTasks(); // Save tasks to localStorage
		renderTasks();
		calculateSummary();
		taskInput.value = "";
		taskDuration.value = "";
	} else {
		alert("Please enter a valid task name and duration.");
	}
}

function renderTasks() {
	taskList.innerHTML = "";
	tasks.forEach((task, index) => {
		const li = document.createElement("li");
		li.textContent = `${task.name} (${task.duration} hours)`;
		if (task.completed) {
			li.classList.add("completed");
		}
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = task.completed;
		checkbox.addEventListener("change", () => toggleTaskCompletion(index));
		li.appendChild(checkbox);
		taskList.appendChild(li);
	});

	// Disable Clear All Button if no tasks
	clearAllBtn.disabled = tasks.length === 0;
}

function toggleTaskCompletion(index) {
	tasks[index].completed = !tasks[index].completed;
	saveTasks(); // Save tasks to localStorage
	renderTasks();
	calculateSummary();
}

function calculateSummary() {
	const total = tasks.reduce((sum, task) => sum + (task.completed ? 0 : task.duration), 0);
	totalTime.textContent = `${total} hours`;

	if (total > 0) {
		const now = new Date();
		const completion = new Date(now.getTime() + total * 60 * 60 * 1000);
		completionTime.textContent = completion.toLocaleTimeString();
	} else {
		completionTime.textContent = "-";
	}
}

// Clear All Tasks Functionality
clearAllBtn.addEventListener("click", () => {
	if (confirm("Are you sure you want to clear all tasks?")) {
		tasks = [];
		saveTasks();
		renderTasks();
		calculateSummary();
	}
});

// Load tasks when the page loads
window.addEventListener("load", () => {
	renderTasks();
	calculateSummary();
});

addTaskBtn.addEventListener("click", addTask);
