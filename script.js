document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        tasks = tasks.filter(task => !task.completed || new Date(task.completionDate) > oneWeekAgo);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        tasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            const deadlineA = a.deadline ? new Date(a.deadline) : Infinity;
            const deadlineB = b.deadline ? new Date(b.deadline) : Infinity;
            return deadlineA - deadlineB;
        });

        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) {
                li.classList.add('completed');
            }

            const daysRemaining = task.deadline ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24)) : null;

            let priorityClass = 'priority-default';
            let priorityText = 'Aucune';
            if (daysRemaining !== null && !task.completed) {
                if (daysRemaining <= 2) {
                    priorityClass = 'priority-haute';
                    priorityText = 'Haute';
                } else if (daysRemaining <= 7) {
                    priorityClass = 'priority-moyenne';
                    priorityText = 'Moyenne';
                } else {
                    priorityClass = 'priority-basse';
                    priorityText = 'Basse';
                }
            } else if (task.completed) {
                priorityText = "Terminée";
            }
            
            // --- MISE À JOUR DU HTML DE LA TÂCHE POUR INCLURE LE BOUTON SUPPRIMER ---
            li.innerHTML = `
                <div class="task-col-checkbox">
                    <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                </div>
                <div class="task-col-main">
                    <span class="task-text">${task.text}</span>
                    <div class="task-details">
                        ${task.deadline ? `Date limite : ${new Date(task.deadline).toLocaleDateString('fr-FR')}` : 'Pas de date limite'}
                    </div>
                </div>
                <div class="task-col-priority">
                    <span class="priority-level ${priorityClass}">${priorityText}</span>
                </div>
                <div class="task-col-actions">
                    <span class="material-icons delete-btn" data-id="${task.id}">close</span>
                </div>
            `;
            taskList.appendChild(li);
        });

        saveTasks();
    };

    const addTask = () => {
        const text = taskInput.value.trim();
        const deadline = deadlineInput.value;

        if (text === '') {
            alert('Veuillez entrer une description pour la tâche.');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            deadline: deadline || null,
            completed: false,
            completionDate: null
        };
        
        tasks.unshift(newTask);
        taskInput.value = '';
        deadlineInput.value = '';
        renderTasks();
    };

    const toggleTask = (id) => {
        const taskIndex = tasks.findIndex(t => t.id == id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            tasks[taskIndex].completionDate = tasks[taskIndex].completed ? new Date().toISOString() : null;
            renderTasks();
        }
    };
    
    // --- NOUVELLE FONCTION POUR SUPPRIMER UNE TÂCHE ---
    const deleteTask = (id) => {
        // Confirmer avant de supprimer
        if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
            tasks = tasks.filter(t => t.id != id);
            renderTasks();
        }
    };

    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addButton.click();
        }
    });

    // --- ÉCOUTEUR D'ÉVÉNEMENT GLOBAL POUR LA LISTE ---
    taskList.addEventListener('click', (e) => {
        // Vérifie si l'utilisateur a cliqué sur la case à cocher
        if (e.target.type === 'checkbox') {
            toggleTask(e.target.dataset.id);
        }
        
        // Vérifie si l'utilisateur a cliqué sur le bouton supprimer
        if (e.target.classList.contains('delete-btn')) {
            deleteTask(e.target.dataset.id);
        }
    });

    renderTasks();
});