const taskRepo = require('../repository/taskRepo');

// Get all tasks
const getAllTasks = async (req, res) => {
    try {
        const tasks = await taskRepo.getAllTasks();
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
};

// Get task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await taskRepo.getTaskById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching task',
            error: error.message
        });
    }
};

// Create new task
const createTask = async (req, res) => {
    try {
        const { title, priority = 'med' } = req.body;

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        if (!['low', 'med', 'high'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Priority must be low, med, or high'
            });
        }

        const task = await taskRepo.createTask(title.trim(), priority);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: error.message
        });
    }
};

// Update task (toggle status or update priority)
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority } = req.body;

        // Validation: at least one field must be provided
        if (status === undefined && priority === undefined) {
            return res.status(400).json({
                success: false,
                message: 'At least one field (status or priority) must be provided'
            });
        }

        // Validation: priority must be valid
        if (priority !== undefined && !['low', 'med', 'high'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Priority must be low, med, or high'
            });
        }

        const task = await taskRepo.updateTask(id, { status, priority });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: error.message
        });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await taskRepo.deleteTask(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message
        });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
