import Expense, { CATEGORIES } from '../models/Expense.js';

const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search, sort = '-date', page = 1, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query).sort(sort).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      count: expenses.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    const expense = await Expense.create({ title, amount, category, date, notes, userId: req.user._id });
    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { title, amount, category, date, notes } = req.body;
    expense.title = title ?? expense.title;
    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.date = date ?? expense.date;
    expense.notes = notes ?? expense.notes;

    await expense.save();
    res.json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [currentMonthStats] = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const [lastMonthStats] = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const categoryStats = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const monthlyTrend = await Expense.aggregate([
      { $match: { userId, date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const recentExpenses = await Expense.find({ userId }).sort('-date').limit(5);

    res.json({
      success: true,
      stats: {
        currentMonth: { total: currentMonthStats?.total || 0, count: currentMonthStats?.count || 0 },
        lastMonth: { total: lastMonthStats?.total || 0, count: lastMonthStats?.count || 0 },
        categoryBreakdown: categoryStats,
        monthlyTrend,
        recentExpenses,
        categories: CATEGORIES,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getExpenses, createExpense, updateExpense, deleteExpense, getStats };
