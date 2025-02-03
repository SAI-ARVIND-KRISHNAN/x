import Notification from "../models/notification.models.js";
import User from "../models/user.models.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(userId);
        const notifications = await Notification.find({to: userId})
        .populate({
            path: "from",
            select: "username profileImg" //only select username and profile image to show in notification
        })

        await Notification.updateMany({to: userId}, {read: true});

        res.status(200).json(notifications);

    } catch (error) {
        console.log("Error in getNotifications controller:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deleteNotifications = async(req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({to: userId});
        res.status(200).json({message: "All notifications deleted successfully"});

    } catch (error) {
        console.log("Error in deleteNotifications controller:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deleteNotification = async(req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({error: "Notification not found"});
        }

        if (notification.to.toString() != userId.toString()) {
            return res.status(403).json({error: "You are not allowed to delete this notification"});
        }

        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({message: "Notification deleted successfully"});
    } catch (error) {
        console.log("Error in deleteNotification controller:", error);
        res.status(500).json({error: "Internal server error"});
    }
}