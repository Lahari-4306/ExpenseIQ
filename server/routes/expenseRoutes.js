import express from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense, getStats } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateExpense } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getExpenses).post(validateExpense, createExpense);
router.route('/:id').put(validateExpense, updateExpense).delete(deleteExpense);

export default router;
