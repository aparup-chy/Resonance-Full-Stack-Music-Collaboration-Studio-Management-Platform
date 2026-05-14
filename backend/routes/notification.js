import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notification.js';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', verifyToken, getNotifications);

// Mark a specific notification as read
router.put('/:notificationId/read', verifyToken, markNotificationAsRead);

// Mark all notifications as read
router.put('/mark-all/read', verifyToken, markAllNotificationsAsRead);

export default router;
