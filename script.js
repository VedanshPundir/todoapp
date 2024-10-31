// Select DOM elements
const input = document.querySelector("input.todo-input");
const dueDateInput = document.querySelector(".due-date-input");
const categorySelect = document.querySelector(".category-select");
const noteInput = document.querySelector(".note-input"); // New note input
const addButton = document.querySelector(".add-button");
const todosHtml = document.querySelector(".todos");
const emptyImage = document.querySelector(".empty-image");
const deleteAllButton = document.querySelector(".delete-all");
const filters = document.querySelectorAll(".filter");
const priorityButtons = document.querySelectorAll('.priority-button');
const completionRateElement = document.getElementById('completion-rate');
const avgTimeSpentElement = document.getElementById('avg-time-spent');
const timelineHtml = document.querySelector(".timeline"); // New element for displaying timeline
const clearTimelineButton = document.querySelector(".clear-timeline-button"); // New clear timeline button

let todosJson = JSON.parse(localStorage.getItem("todos")) || [];
let timelineJson = JSON.parse(localStorage.getItem("timeline")) || []; // To store timeline events
let filter = '';
let selectedPriority = 'low';
let selectedCategory = categorySelect.value;

showTodos();
updateAnalytics();
showTimeline(); // Display the timeline when the app loads

// Event listeners for priority buttons
priorityButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedPriority = button.dataset.priority;
    priorityButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// Event listener for category selection
categorySelect.addEventListener('change', () => {
  selectedCategory = categorySelect.value;
});

// Generate HTML for each todo
function getTodoHtml(todo, index) {
  if (filter && filter != todo.status) {
    return '';
  }
  let checked = todo.status === "completed" ? "checked" : "";
  return `
    <li class="todo ${todo.priority}" title="${todo.note || 'No note'}"> <!-- Hover over the item to see the note -->
      <label for="${index}">
        <input id="${index}" onclick="updateStatus(this)" type="checkbox" ${checked}>
        <span class="${checked}">${todo.name} (${todo.priority})</span>
        <span style="margin-left: 10px;">Due: ${new Date(todo.dueDate).toLocaleDateString()}</span>
        <span style="margin-left: 10px;">Category: ${todo.category || 'No category'}</span> <!-- Display the category -->
      </label>
      <button class="delete-btn" data-index="${index}" onclick="remove(this)">
        <i class="fa fa-times"></i>
      </button>
    </li>
  `;
}

// Display todos in the UI
function showTodos() {
  if (todosJson.length === 0) {
    todosHtml.innerHTML = '';
    emptyImage.style.display = 'block';
  } else {
    todosHtml.innerHTML = todosJson.map(getTodoHtml).join('');
    emptyImage.style.display = 'none';
  }
}

// Add a new todo
function addTodo() {
  const todo = input.value.trim();
  const dueDate = dueDateInput.value;
  const note = noteInput.value.trim(); // Get note input

  if (!todo || !dueDate) {
    alert("Please enter a task and a due date.");
    return;
  }

  input.value = "";
  dueDateInput.value = "";
  noteInput.value = ""; // Clear note input

  todosJson.unshift({
    name: todo,
    status: "pending",
    priority: selectedPriority,
    dueDate: dueDate,
    addedDate: new Date(),  // Add timestamp when task is added
    timeSpent: 0,
    note: note,  // Add note property
    category: selectedCategory // Set the category field
  });

  // Add a timeline entry for the addition
  addTimelineEntry(`Task "${todo}" added.`);

  localStorage.setItem("todos", JSON.stringify(todosJson));
  localStorage.setItem("timeline", JSON.stringify(timelineJson)); // Store the timeline
  showTodos();
  updateAnalytics();  // Update analytics after adding a task
  showTimeline(); // Update timeline display
}

// Update the status of a todo (including completion time)
function updateStatus(todo) {
  let todoIndex = todo.id;
  const oldStatus = todosJson[todoIndex].status;
  todosJson[todoIndex].status = todo.checked ? "completed" : "pending";
  
  // If task is completed, store the completed time
  if (todo.checked) {
    todosJson[todoIndex].completedDate = new Date();
    // Add a timeline entry for completion
    addTimelineEntry(`Task "${todosJson[todoIndex].name}" completed.`);
  } else {
    delete todosJson[todoIndex].completedDate;  // Remove completed date if unchecked
    // Add a timeline entry for reversion
    addTimelineEntry(`Task "${todosJson[todoIndex].name}" reverted to pending.`);
  }

  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos();
  updateAnalytics();  // Update analytics after status change
  showTimeline(); // Update timeline display
}

// Remove a todo
function remove(todo) {
  if (confirm("Are you sure you want to delete this task?")) {
    const index = todo.dataset.index;
    addTimelineEntry(`Task "${todosJson[index].name}" removed.`);
    todosJson.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todosJson));
    showTodos();
    updateAnalytics();  // Update analytics after deleting a task
    showTimeline(); // Update timeline display
  }
}

// Add a timeline entry
function addTimelineEntry(message) {
  const timestamp = new Date().toLocaleString();
  timelineJson.unshift({ message, timestamp });
  localStorage.setItem("timeline", JSON.stringify(timelineJson)); // Store the timeline
}

// Display the timeline
function showTimeline() {
  if (timelineJson.length === 0) {
    timelineHtml.innerHTML = '<p>No activity recorded.</p>';
  } else {
    timelineHtml.innerHTML = timelineJson.map(entry => 
      `<li>${entry.timestamp}: ${entry.message}</li>`
    ).join('');
  }
}

// Clear the timeline
function clearTimeline() {
  if (confirm("Are you sure you want to clear the timeline?")) {
    timelineJson = []; // Clear the timeline array
    localStorage.setItem("timeline", JSON.stringify(timelineJson)); // Clear timeline in local storage
    showTimeline(); // Update the timeline display
  }
}

// Calculate and update analytics
function updateAnalytics() {
  const totalTasks = todosJson.length;
  const completedTasks = todosJson.filter(todo => todo.status === 'completed').length;
  
  // Calculate completion rate
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  // Calculate average time spent on completed tasks
  let totalTimeSpent = 0;
  const completedTodosWithTime = todosJson.filter(todo => todo.status === 'completed' && todo.addedDate && todo.completedDate);

  completedTodosWithTime.forEach(todo => {
    const timeSpentHours = (new Date(todo.completedDate) - new Date(todo.addedDate)) / (1000 * 60 * 60);
    totalTimeSpent += timeSpentHours;
  });

  const avgTimeSpent = completedTodosWithTime.length === 0 ? 0 : (totalTimeSpent / completedTodosWithTime.length).toFixed(2);

  // Update the UI
  completionRateElement.textContent = `${completionRate}%`;
  avgTimeSpentElement.textContent = `${avgTimeSpent} hours`;
}

// Event listener for the Add button
addButton.addEventListener("click", addTodo);

// Event listener for the Enter key to add todo
input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Filter todos based on their status
filters.forEach((el) => {
  el.addEventListener("click", (e) => {
    filters.forEach(tag => tag.classList.remove('active'));
    el.classList.add('active');
    filter = e.target.dataset.filter;
    showTodos();
  });
});

// Event listener for Delete All button
deleteAllButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    todosJson = [];
    timelineJson = []; // Clear timeline on delete all
    localStorage.setItem("todos", JSON.stringify(todosJson));
    localStorage.setItem("timeline", JSON.stringify(timelineJson)); // Clear timeline storage
    showTodos();
    updateAnalytics();  // Update analytics after deleting all tasks
    showTimeline(); // Update timeline display
  }
});

// Event listener for Clear Timeline button
clearTimelineButton.addEventListener("click", clearTimeline);

// Login check and todo, analytics display on load
window.onload = function() {
  // Ensure the user is logged in
  const loggedIn = localStorage.getItem('loggedIn');
  
  if (!loggedIn) {
    window.location.href = 'index.html';
  } else {
    // Show todos, analytics, and timeline if logged in
    showTodos();
    updateAnalytics();
    showTimeline();
  }
};


/*____________________*/
document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput');
    const addButton = document.getElementById('addButton');
    const todoList = document.getElementById('todoList');

    // Load todos from localStorage
    loadTodos();

    // Add new todo
    addButton.addEventListener('click', () => {
        const todoText = todoInput.value.trim();
        if (todoText) {
            addTodo(todoText);
            todoInput.value = ''; // Clear input field
        }
    });

    // Function to add a new todo
    function addTodo(text) {
        const todoItem = document.createElement('li');
        todoItem.textContent = text;

        // Mark as completed
        todoItem.addEventListener('click', () => {
            todoItem.classList.toggle('completed');
            saveTodos();
        });

        // Remove todo on double click
        todoItem.addEventListener('dblclick', () => {
            todoList.removeChild(todoItem);
            saveTodos();
        });

        todoList.appendChild(todoItem);
        saveTodos(); // Save todos after adding
    }

    // Function to load todos from localStorage
    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach(todo => {
            addTodo(todo);
        });
    }

    // Function to save todos to localStorage
    function saveTodos() {
        const todos = [];
        document.querySelectorAll('#todoList li').forEach(item => {
            todos.push(item.textContent);
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');

    // Logout button click event
    logoutButton.addEventListener('click', () => {
        // Optionally, clear any user session data here
        // localStorage.removeItem('userSession'); // If you're using localStorage for session data

        // Redirect to login page
        window.location.href = 'index.html'; // Ensure this is the correct path to your login page
    });
});
