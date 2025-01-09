// notificationService.js
class NotificationService {
    constructor() {
        this.notifications = {};
    }

    addNotification(userId, notification) {
        if (!this.notifications[userId]) {
            this.notifications[userId] = [];
        }
        this.notifications[userId].push(notification);
    }

    getNotifications(userId) {
        return this.notifications[userId] || [];
    }

    clearNotifications(userId) {
        delete this.notifications[userId];
    }
}

const notificationService = new NotificationService();
module.exports = notificationService;
