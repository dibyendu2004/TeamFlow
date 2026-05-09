import express from 'express';
import { createTask, getTasks, updateTask, deleteTask, getUserTasks } from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true }); // Important if task routes depend on /api/projects/:projectId/tasks

router.get('/user/me', protect, getUserTasks);

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:taskId')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

export default router;
