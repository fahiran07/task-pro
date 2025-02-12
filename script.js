const taskInput = document.getElementById("taskInput");
const taskHours = document.getElementById("taskHours");
const taskMinutes = document.getElementById("taskMinutes");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const totalTime = document.getElementById("totalTime");
const completionTime = document.getElementById("completionTime");
const clearAllBtn = document.getElementById("clearAllBtn");

// Load tasks from localStorage when the page loads
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
	localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
	const taskName = taskInput.value.trim();
	const hours = parseInt(taskHours.value) || 0;
	const minutes = parseInt(taskMinutes.value) || 0;

	if (taskName && (hours > 0 || minutes > 0)) {
		const task = {
			name: taskName,
			hours: hours,
			minutes: minutes,
			completed: false,
		};
		tasks.push(task);
		saveTasks(); // Save tasks to localStorage
		renderTasks();
		calculateSummary();
		taskInput.value = "";
		taskHours.value = "0";
		taskMinutes.value = "0";
	} else {
		alert("Please enter a valid task name and duration.");
	}
}

function renderTasks() {
	taskList.innerHTML = "";
	tasks.forEach((task, index) => {
		const li = document.createElement("li");
		li.className = "task-item";
		li.style.display = "flex";
		li.style.justifyContent = "space-between";
		li.style.alignItems = "center";

		if (task.completed) {
			li.classList.add("completed");
		}

		// Task name and duration
		const taskText = document.createElement("span");
		taskText.textContent = `${task.name} (${task.hours}h ${task.minutes}m)`;

		// Action container for checkbox + delete button
		const actionDiv = document.createElement("div");
		actionDiv.style.display = "flex";
		actionDiv.style.alignItems = "center";
		actionDiv.style.gap = "10px"; // Space between checkbox & delete btn

		// Checkbox
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = task.completed;
		checkbox.addEventListener("change", () => toggleTaskCompletion(index));

		// Delete button
		const deleteBtn = document.createElement("button");
		deleteBtn.className = "delete-btn";
		deleteBtn.textContent = "Delete";
		deleteBtn.style.padding = "5px 10px";
		deleteBtn.style.fontSize = "0.7rem";
		deleteBtn.addEventListener("click", () => deleteTask(index));

		// Append checkbox & delete button in action div
		actionDiv.appendChild(checkbox);
		actionDiv.appendChild(deleteBtn);

		// Append elements to li
		li.appendChild(taskText);
		li.appendChild(actionDiv);

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

function deleteTask(index) {
	tasks.splice(index, 1); // Remove the task
	saveTasks(); // Save tasks to localStorage
	renderTasks();
	calculateSummary();
}

function calculateSummary() {
	let totalHours = 0;
	let totalMinutes = 0;

	tasks.forEach((task) => {
		if (!task.completed) {
			totalHours += task.hours;
			totalMinutes += task.minutes;
		}
	});

	// Convert excess minutes to hours
	totalHours += Math.floor(totalMinutes / 60);
	totalMinutes = totalMinutes % 60;

	totalTime.textContent = `${totalHours}h ${totalMinutes}m`;

	if (totalHours > 0 || totalMinutes > 0) {
		const now = new Date();
		const completion = new Date(now.getTime() + (totalHours * 60 + totalMinutes) * 60 * 1000);
		completionTime.textContent = completion.toLocaleTimeString();
	} else {
		completionTime.textContent = "-";
	}
}

// Clear All Tasks Functionality
clearAllBtn.addEventListener("click", () => {
	if (confirm("Are you sure you want to clear all tasks?")) {
		tasks = []; // Clear the tasks array
		saveTasks(); // Update localStorage
		renderTasks(); // Re-render the task list
		calculateSummary(); // Update the summary
	}
});

// Load tasks when the page loads
window.addEventListener("load", () => {
	renderTasks();
	calculateSummary();
});

addTaskBtn.addEventListener("click", addTask);
