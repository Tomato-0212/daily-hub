const express = require('express');
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

const router = express.Router();

// GET all tasks
router.get('/', getAllTasks);

// GET single task by ID
router.get('/:id', getTaskById);

// POST create new task
router.post('/', createTask);

// PUT update task
router.put('/:id', updateTask);

// DELETE task
router.delete('/:id', deleteTask);

module.exports = router;
