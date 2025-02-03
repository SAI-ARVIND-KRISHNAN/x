import express from 'express';

import protectRoute from '../middleware/protectRoute.middleware.js';
import { getNotifications, deleteNotifications, deleteNotification} from '../controllers/notification.controllers.js';


const notificationRouter = express.Router();

notificationRouter.get("/", protectRoute, getNotifications);
notificationRouter.delete("/", protectRoute, deleteNotifications);
notificationRouter.delete("/:id", protectRoute, deleteNotification);

export default notificationRouter;