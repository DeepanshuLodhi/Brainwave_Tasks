// DOM Elements
const currentDateElement = document.getElementById('current-date');
const datePicker = document.getElementById('date-picker');
const prevDayBtn = document.getElementById('prev-day');
const nextDayBtn = document.getElementById('next-day');
const todayBtn = document.getElementById('today-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const clearAllBtn = document.getElementById('clear-all');
const addTaskBtn = document.getElementById('add-task');
const timeBlocksContainer = document.getElementById('time-blocks');
const dayNotesTextarea = document.getElementById('day-notes');
const saveNotesBtn = document.getElementById('save-notes');
const taskModal = document.getElementById('task-modal');
const closeModalBtn = document.getElementById('close-modal');
const taskForm = document.getElementById('task-form');
const taskTimeSelect = document.getElementById('task-time');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskPrioritySelect = document.getElementById('task-priority');

// App State
let currentDate = new Date();
let selectedTimeBlock = null;
let tasks = {};
let notes = {};
let isDarkMode = false;

// Initialize App
function initApp() {
    // Set up date picker with today's date
    const today = new Date();
    const formattedDate = formatDateForInput(today);
    datePicker.value = formattedDate;
    
    // Load tasks and notes from localStorage
    loadFromLocalStorage();
    
    // Load theme preference
    loadThemePreference();
    
    // Generate time blocks
    generateTimeBlocks();
    
    // Display current date in header
    updateCurrentDateDisplay();
    
    // Load tasks and notes for current date
    loadTasksForCurrentDate();
    loadNotesForCurrentDate();
    
    // Fill task time select options
    fillTimeOptions();
    
    // Set up event listeners
    setupEventListeners();
}

// Utility Functions
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTimeForDisplay(hour, minute = 0) {
    return new Date(2020, 0, 1, hour, minute).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
}

function getCurrentDateKey() {
    return formatDateForInput(currentDate);
}

// LocalStorage Functions
function saveToLocalStorage() {
    localStorage.setItem('dayPlannerTasks', JSON.stringify(tasks));
    localStorage.setItem('dayPlannerNotes', JSON.stringify(notes));
    localStorage.setItem('dayPlannerDarkMode', JSON.stringify(isDarkMode));
}

function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem('dayPlannerTasks');
    const savedNotes = localStorage.getItem('dayPlannerNotes');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
}

// Theme Functions
function loadThemePreference() {
    const savedTheme = localStorage.getItem('dayPlannerDarkMode');
    
    if (savedTheme !== null) {
        isDarkMode = JSON.parse(savedTheme);
        
        if (isDarkMode) {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    }
}

function toggleTheme() {
    if (isDarkMode) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
    
    isDarkMode = !isDarkMode;
    localStorage.setItem('dayPlannerDarkMode', JSON.stringify(isDarkMode));
}

function enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
}

function enableLightMode() {
    document.documentElement.removeAttribute('data-theme');
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
}

// Time Block Functions
function generateTimeBlocks() {
    timeBlocksContainer.innerHTML = '';
    
    // Generate time blocks for business hours (7 AM to 9 PM)
    for (let hour = 7; hour <= 21; hour++) {
        const timeBlock = document.createElement('div');
        timeBlock.classList.add('time-block');
        timeBlock.dataset.hour = hour;
        
        const timeElement = document.createElement('div');
        timeElement.classList.add('time');
        timeElement.textContent = formatTimeForDisplay(hour);
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('task-content');
        contentElement.dataset.hour = hour;
        
        // Create empty task placeholder
        const emptyTask = document.createElement('div');
        emptyTask.classList.add('empty-task');
        emptyTask.textContent = 'No task scheduled';
        contentElement.appendChild(emptyTask);
        
        const actionsElement = document.createElement('div');
        actionsElement.classList.add('task-actions');
        
        const addBtn = document.createElement('button');
        addBtn.classList.add('btn', 'btn-circle', 'btn-action');
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.dataset.hour = hour;
        addBtn.addEventListener('click', (e) => {
            openAddTaskModal(hour);
        });
        
        actionsElement.appendChild(addBtn);
        
        timeBlock.appendChild(timeElement);
        timeBlock.appendChild(contentElement);
        timeBlock.appendChild(actionsElement);
        
        timeBlocksContainer.appendChild(timeBlock);
    }
}

function loadTasksForCurrentDate() {
    const dateKey = getCurrentDateKey();
    const dayTasks = tasks[dateKey] || {};
    
    // Clear all task content first
    document.querySelectorAll('.task-content').forEach(content => {
        const hour = content.dataset.hour;
        content.innerHTML = '';
        
        const emptyTask = document.createElement('div');
        emptyTask.classList.add('empty-task');
        emptyTask.textContent = 'No task scheduled';
        content.appendChild(emptyTask);
    });
    
    // Add tasks to their respective time blocks
    for (const hour in dayTasks) {
        const taskData = dayTasks[hour];
        const content = document.querySelector(`.task-content[data-hour="${hour}"]`);
        
        if (content) {
            content.innerHTML = ''; // Clear empty task placeholder
            
            const taskElement = createTaskElement(taskData, hour);
            content.appendChild(taskElement);
        }
    }
}

function createTaskElement(taskData, hour) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    
    // Priority badge
    const priorityBadge = document.createElement('span');
    priorityBadge.classList.add('task-priority', `priority-${taskData.priority}`);
    priorityBadge.textContent = taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1);
    
    // Task title
    const taskTitle = document.createElement('div');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = taskData.title;
    
    // Task description (if any)
    if (taskData.description) {
        const taskDesc = document.createElement('div');
        taskDesc.classList.add('task-description');
        taskDesc.textContent = taskData.description;
        taskElement.appendChild(taskDesc);
    }
    
    // Add completed class if task is completed
    if (taskData.completed) {
        taskTitle.classList.add('completed-task');
    }
    
    // Add everything to task element
    taskElement.appendChild(priorityBadge);
    taskElement.appendChild(taskTitle);
    
    // Add event listeners for the task
    taskElement.addEventListener('click', () => {
        editTask(hour);
    });
    
    return taskElement;
}

function loadNotesForCurrentDate() {
    const dateKey = getCurrentDateKey();
    const dayNotes = notes[dateKey] || '';
    dayNotesTextarea.value = dayNotes;
}

// Task Modal Functions
function openAddTaskModal(hour) {
    selectedTimeBlock = hour;
    
    // Set the time in the dropdown
    taskTimeSelect.value = hour;
    
    // Check if there's an existing task
    const dateKey = getCurrentDateKey();
    const dayTasks = tasks[dateKey] || {};
    const existingTask = dayTasks[hour];
    
    // If editing existing task, fill the form
    if (existingTask) {
        taskTitleInput.value = existingTask.title;
        taskDescriptionInput.value = existingTask.description || '';
        taskPrioritySelect.value = existingTask.priority;
    } else {
        // Reset form for new task
        taskForm.reset();
    }
    
    // Show modal
    taskModal.style.display = 'flex';
}

function closeTaskModal() {
    taskModal.style.display = 'none';
    selectedTimeBlock = null;
    taskForm.reset();
}

function editTask(hour) {
    openAddTaskModal(hour);
}

function saveTask(event) {
    event.preventDefault();
    
    const hour = taskTimeSelect.value;
    const title = taskTitleInput.value;
    const description = taskDescriptionInput.value;
    const priority = taskPrioritySelect.value;
    
    // Create task object
    const taskData = {
        title,
        description,
        priority,
        completed: false
    };
    
    // Save task to tasks object
    const dateKey = getCurrentDateKey();
    if (!tasks[dateKey]) {
        tasks[dateKey] = {};
    }
    
    tasks[dateKey][hour] = taskData;
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Reload tasks
    loadTasksForCurrentDate();
    
    // Close modal
    closeTaskModal();
}

function deleteTask(hour) {
    const dateKey = getCurrentDateKey();
    
    if (tasks[dateKey] && tasks[dateKey][hour]) {
        delete tasks[dateKey][hour];
        saveToLocalStorage();
        loadTasksForCurrentDate();
    }
}

function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks for this day?')) {
        const dateKey = getCurrentDateKey();
        delete tasks[dateKey];
        saveToLocalStorage();
        loadTasksForCurrentDate();
    }
}

function toggleTaskCompletion(hour) {
    const dateKey = getCurrentDateKey();
    
    if (tasks[dateKey] && tasks[dateKey][hour]) {
        tasks[dateKey][hour].completed = !tasks[dateKey][hour].completed;
        saveToLocalStorage();
        loadTasksForCurrentDate();
    }
}

// Date Navigation Functions
function goToDate(date) {
    currentDate = new Date(date);
    datePicker.value = formatDateForInput(currentDate);
    updateCurrentDateDisplay();
    loadTasksForCurrentDate();
    loadNotesForCurrentDate();
}

function goToPreviousDay() {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    goToDate(prevDay);
}

function goToNextDay() {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    goToDate(nextDay);
}

function goToToday() {
    goToDate(new Date());
}

function updateCurrentDateDisplay() {
    currentDateElement.textContent = formatDateForDisplay(currentDate);
}

// Notes Functions
function saveNotes() {
    const dateKey = getCurrentDateKey();
    notes[dateKey] = dayNotesTextarea.value;
    saveToLocalStorage();
    
    // Show feedback
    const saveBtn = document.getElementById('save-notes');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.disabled = true;
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }, 1500);
}

// Fill time options in the task modal
function fillTimeOptions() {
    taskTimeSelect.innerHTML = '';
    
    for (let hour = 7; hour <= 21; hour++) {
        const option = document.createElement('option');
        option.value = hour;
        option.textContent = formatTimeForDisplay(hour);
        taskTimeSelect.appendChild(option);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Date navigation
    prevDayBtn.addEventListener('click', goToPreviousDay);
    nextDayBtn.addEventListener('click', goToNextDay);
    todayBtn.addEventListener('click', goToToday);
    datePicker.addEventListener('change', (e) => goToDate(e.target.value));
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Tasks
    clearAllBtn.addEventListener('click', clearAllTasks);
    addTaskBtn.addEventListener('click', () => openAddTaskModal(9)); // Default to 9 AM
    
    // Task Modal
    closeModalBtn.addEventListener('click', closeTaskModal);
    taskForm.addEventListener('submit', saveTask);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });
    
    // Notes
    saveNotesBtn.addEventListener('click', saveNotes);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Close modal with Escape key
        if (e.key === 'Escape' && taskModal.style.display === 'flex') {
            closeTaskModal();
        }
        
        // Toggle dark mode with Shift+D
        if (e.key === 'D' && e.shiftKey) {
            toggleTheme();
        }
    });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);