document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');

    // LocalStorage key
    const STORAGE_KEY = 'todolist_tasks';

    // Load tasks on page load
    fetchTasks();

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Get tasks from LocalStorage
    function getTasks() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // Save tasks to LocalStorage
    function saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // Fetch and render tasks
    function fetchTasks() {
        const tasks = getTasks();
        renderTasks(tasks);
    }

    // Add new task
    function addTask() {
        const title = taskInput.value.trim();
        if (!title) {
            taskInput.classList.add('shake');
            setTimeout(() => taskInput.classList.remove('shake'), 500);
            return;
        }

        const tasks = getTasks();
        const newTask = {
            id: Date.now(), // Unique ID based on timestamp
            title: title,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        tasks.unshift(newTask); // Add to beginning (newest first)
        saveTasks(tasks);
        taskInput.value = '';
        renderTasks(tasks);
    }

    // Toggle task status
    function toggleTask(id, currentStatus, element) {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        const tasks = getTasks();
        
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            saveTasks(tasks);
            
            if (newStatus === 'completed') {
                createParticles(element);
            }
            renderTasks(tasks);
        }
    }

    // Delete task
    function deleteTask(id) {
        const tasks = getTasks();
        const filteredTasks = tasks.filter(t => t.id !== id);
        saveTasks(filteredTasks);
        renderTasks(filteredTasks);
    }

    function renderTasks(tasks) {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state">✨ No tasks yet. Start your day!</div>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.status}`;
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="checkbox"></div>
                    <span class="task-text">${escapeHtml(task.title)}</span>
                </div>
                <button class="delete-btn" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;

            // Event listeners
            const contentDiv = li.querySelector('.task-content');
            contentDiv.addEventListener('click', (e) => toggleTask(task.id, task.status, e.currentTarget));
            
            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });

            taskList.appendChild(li);
        });
    }

    function createParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + 20;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            document.body.appendChild(particle);

            const tx = (Math.random() - 0.5) * 100;
            const ty = (Math.random() - 0.5) * 100;
            const color = `hsl(${Math.random() * 360}, 70%, 50%)`;

            particle.style.backgroundColor = color;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            setTimeout(() => particle.remove(), 800);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
