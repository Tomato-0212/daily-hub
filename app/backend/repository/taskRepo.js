const pool = require('../db');

// Get all tasks ordered by created date
const getAllTasks = async () => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    return result.rows;
};

// Get task by ID
const getTaskById = async (id) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// Create new task
const createTask = async (title, priority) => {
    const result = await pool.query(
        'INSERT INTO tasks (title, priority, status) VALUES ($1, $2, $3) RETURNING *',
        [title, priority, false]
    );
    return result.rows[0];
};

// Update task (status and/or priority)
const updateTask = async (id, updates) => {
    let query = 'UPDATE tasks SET ';
    let values = [];
    let paramCount = 1;

    // Add status if provided
    if (updates.status !== undefined) {
        query += `status = $${paramCount}`;
        values.push(updates.status);
        paramCount++;
    }

    // Add priority if provided
    if (updates.priority !== undefined) {
        if (values.length > 0) {
            query += ', ';
        }
        query += `priority = $${paramCount}`;
        values.push(updates.priority);
        paramCount++;
    }

    // Add updated_at timestamp and WHERE clause
    query += `, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

// Delete task
const deleteTask = async (id) => {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
