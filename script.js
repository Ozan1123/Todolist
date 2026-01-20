document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const KEY = 'tl';

    migrateOldData();
    render();

    addBtn.addEventListener('click', add);
    taskInput.addEventListener('keypress', e => e.key === 'Enter' && add());

    function get() {
        try {
            const d = localStorage.getItem(KEY);
            return d ? JSON.parse(d).map(x => ({
                id: x.i, title: x.t, status: x.s ? 'completed' : 'pending', created: x.c
            })) : [];
        } catch { return []; }
    }

    function save(tasks) {
        localStorage.setItem(KEY, JSON.stringify(tasks.map(x => ({
            i: x.id, t: x.title, s: x.status === 'completed' ? 1 : 0, c: x.created
        }))));
    }

    function migrateOldData() {
        const old = localStorage.getItem('todolist_tasks');
        if (!old) return;
        try {
            const data = JSON.parse(old);
            if (data.length && data[0].title) {
                save(data.map(x => ({
                    id: x.id, title: x.title, status: x.status,
                    created: Math.floor(new Date(x.created_at).getTime() / 1000)
                })));
                localStorage.removeItem('todolist_tasks');
            }
        } catch {}
    }

    function render() {
        const tasks = get();
        if (!tasks.length) {
            taskList.innerHTML = '<div class="empty-state">No tasks yet</div>';
            return;
        }
        taskList.innerHTML = tasks.map(t => `
            <li class="task-item ${t.status}" data-id="${t.id}">
                <div class="task-content">
                    <div class="checkbox"></div>
                    <span class="task-text">${esc(t.title)}</span>
                </div>
                <button class="delete-btn" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </li>
        `).join('');

        taskList.querySelectorAll('.task-item').forEach(li => {
            const id = +li.dataset.id;
            li.querySelector('.task-content').onclick = e => toggle(id, e.currentTarget);
            li.querySelector('.delete-btn').onclick = e => { e.stopPropagation(); del(id); };
        });
    }

    function add() {
        const title = taskInput.value.trim();
        if (!title) {
            taskInput.classList.add('shake');
            setTimeout(() => taskInput.classList.remove('shake'), 400);
            return;
        }
        const tasks = get();
        tasks.unshift({ id: Date.now(), title, status: 'pending', created: Math.floor(Date.now() / 1000) });
        save(tasks);
        taskInput.value = '';
        render();
    }

    function toggle(id, el) {
        const tasks = get();
        const t = tasks.find(x => x.id === id);
        if (t) {
            t.status = t.status === 'pending' ? 'completed' : 'pending';
            save(tasks);
            if (t.status === 'completed') particles(el);
            render();
        }
    }

    function del(id) {
        save(get().filter(x => x.id !== id));
        render();
    }

    function particles(el) {
        const r = el.getBoundingClientRect();
        const colors = ['#dc2626', '#38bdf8', '#c4c4cc', '#059669'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.cssText = `left:${r.left + 20}px;top:${r.top + r.height / 2}px;background:${colors[i % 4]}`;
            p.style.setProperty('--tx', (Math.random() - .5) * 80 + 'px');
            p.style.setProperty('--ty', (Math.random() - .5) * 80 + 'px');
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 700);
        }
    }

    function esc(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }
});
