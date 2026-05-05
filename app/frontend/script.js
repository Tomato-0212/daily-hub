let tasks = JSON.parse(localStorage.getItem("dh2_tasks") || "[]");
let curP = "med";
let curF = "all";

// date
(() => {
    const d = new Date();
    const opts = { weekday: "short", month: "short", day: "numeric" };
    document.getElementById("date-label").textContent = d
        .toLocaleDateString("en-US", opts)
        .toUpperCase();
})();

function save() {
    localStorage.setItem("dh2_tasks", JSON.stringify(tasks));
}

function selP(p) {
    curP = p;
    document.querySelectorAll(".p-pill").forEach((el) => {
        el.className = "p-pill" + (el.dataset.p === p ? " sel-" + p : "");
    });
}

function addTask() {
    const inp = document.getElementById("inp");
    const text = inp.value.trim();
    if (!text) return inp.focus();
    const now = new Date();
    const t =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0");
    tasks.unshift({ id: Date.now(), text, p: curP, done: false, time: t });
    inp.value = "";
    inp.focus();
    save();
    render();
}

function toggle(id) {
    const t = tasks.find((x) => x.id === id);
    if (t) {
        t.done = !t.done;
        save();
        render();
    }
}

function del(id) {
    tasks = tasks.filter((x) => x.id !== id);
    save();
    render();
}

function setF(f, el) {
    curF = f;
    document
        .querySelectorAll(".f-btn")
        .forEach((b) => b.classList.remove("active"));
    el.classList.add("active");
    render();
}

function render() {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const left = total - done;
    const high = tasks.filter((t) => t.p === "high" && !t.done).length;
    document.getElementById("s-total").textContent = total;
    document.getElementById("s-done").textContent = done;
    document.getElementById("s-left").textContent = left;
    document.getElementById("s-high").textContent = high;
    document.getElementById("prog").style.width =
        (total ? Math.round((done / total) * 100) : 0) + "%";

    let list = tasks;
    if (curF === "todo") list = tasks.filter((t) => !t.done);
    if (curF === "done") list = tasks.filter((t) => t.done);
    if (curF === "high") list = tasks.filter((t) => t.p === "high");

    const el = document.getElementById("list");
    if (!list.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">✓</div>No tasks here</div>`;
        return;
    }
    el.innerHTML = list
        .map(
            (t) => `
    <div class="task ${t.p} ${t.done ? "done" : ""}">
      <div class="cb ${t.done ? "checked" : ""}" onclick="toggle(${t.id})">
        <svg viewBox="0 0 12 9"><polyline points="1,4.5 4.5,8 11,1"/></svg>
      </div>
      <div class="task-body">
        <div class="task-text">${esc(t.text)}</div>
        <div class="task-footer">
          <span class="badge ${t.p}">${t.p}</span>
          <span class="task-time">${t.time}</span>
        </div>
      </div>
      <button class="del-btn" onclick="del(${t.id})" title="Delete">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
        </svg>
      </button>
    </div>
  `,
        )
        .join("");
}

function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

render();
