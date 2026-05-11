// API Helper Functions
// ฟังก์ชันทั้งหมดสำหรับเรียก backend API

// ดึง URL มาจาก config
const tasksUrl = getApiUrl(API_CONFIG.ENDPOINTS.TASKS);

// ===============================
// API Functions
// ===============================

// GET - ดึงทุก tasks
async function fetchAllTasks() {
    try {
        const response = await fetch(tasksUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        // Map database columns to frontend format
        const tasks = (result.data || result || []).map(t => ({
            id: t.id,
            text: t.title, // แปลง title เป็น text สำหรับ frontend
            done: t.status, // แปลง status เป็น done สำหรับ frontend
            p: t.priority, // แปลง priority เป็น p สำหรับ frontend
            time: new Date(t.create_at).toLocaleTimeString('en-US',
                { hour: '2-digit', minute: '2-digit', hour12: false }
            ) // แปลง create_at เป็น time สำหรับ frontend
        }));

        // ตรวจสอบว่า response มี data field หรือไม่
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

// GET - ดึง task เดียว
async function fetchTaskById(id) {
    try {
        const response = await fetch(`${tasksUrl}/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result.data || result || null;
    } catch (error) {
        console.error('Error fetching task:', error);
        return null;
    }
}

// POST - สร้าง task ใหม่
async function createTaskApi(taskData) {
    try {
        // แปลง text เป็น title สำหรับส่ง backend
        const payload = {
            title: taskData.text,
            priority: taskData.p
        };
        
        const response = await fetch(tasksUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating task:', error);
        return null;
    }
}

// PUT - อัปเดต task
async function updateTaskApi(id, taskData) {
    try {
        // แปลง done เป็น status สำหรับส่ง backend
        const payload = {};
        if (taskData.done !== undefined) {
            payload.status = taskData.done;
        }
        if (taskData.p !== undefined) {
            payload.priority = taskData.p;
        }
        
        const response = await fetch(`${tasksUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating task:', error);
        return null;
    }
}

// DELETE - ลบ task
async function deleteTaskApi(id) {
    try {
        const response = await fetch(`${tasksUrl}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting task:', error);
        return null;
    }
}
