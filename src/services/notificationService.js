/**
 * WheelPro Notification Service
 * Uses Browser Notification API with smart daily throttling.
 * Each truck is notified at most 3 times per day:
 *   - Morning   (09:00 – 12:59)
 *   - Afternoon (13:00 – 17:59)
 *   - Evening   (18:00 – 22:59)
 */

const STORAGE_KEY = 'wheelPro_notifLog';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns today's date string, e.g. "2026-04-03" */
const todayStr = () => new Date().toISOString().slice(0, 10);

/** Returns the current time slot for throttling */
const currentSlot = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 13) return 'morning';
    if (hour >= 13 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 23) return 'evening';
    return null; // Outside quiet hours — don't notify
};

/** Loads the notification log from localStorage */
const loadLog = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
};

/** Saves the notification log to localStorage */
const saveLog = (log) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch { /* storage full — skip */ }
};

/**
 * Checks whether a notification for this truck + slot has already been sent today.
 * If not, marks it as sent and returns true (allowed to notify).
 */
const canNotify = (truckId) => {
    const slot = currentSlot();
    if (!slot) return false; // Quiet hours

    const log = loadLog();
    const today = todayStr();
    const key = `${today}::${truckId}::${slot}`;

    if (log[key]) return false; // Already notified in this slot today

    // Mark as notified
    log[key] = true;

    // Prune old entries (keep only today's)
    for (const k of Object.keys(log)) {
        if (!k.startsWith(today)) delete log[k];
    }

    saveLog(log);
    return true;
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Request browser permission for notifications
 */
export const requestLocalNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return false;
    }
    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Show a single browser notification (only if permission granted)
 */
export const showLocalNotification = (title, body) => {
    if (Notification.permission !== 'granted') return;
    new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
    });
};

/**
 * Check all trucks for due/overdue alignments and notify.
 * Each truck is notified at most ONCE per time slot (morning / afternoon / evening).
 * So a truck can receive at most 3 notifications per day.
 */
export const checkAndNotifyAlignments = (trucks) => {
    if (Notification.permission !== 'granted') return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    trucks.forEach(truck => {
        if (!truck.nextDueDate) return;

        const dueDate = new Date(truck.nextDueDate);
        const isOverdue = dueDate < today;
        const isDueSoon = dueDate >= today && dueDate <= nextWeek;

        if (!isOverdue && !isDueSoon) return;

        // Throttle: at most once per slot per truck
        if (!canNotify(truck.id)) return;

        const label = truck.truckNumber || truck.id || 'Unknown Truck';

        if (isOverdue) {
            showLocalNotification(
                '⚠️ Overdue Alignment',
                `Truck ${label} is OVERDUE for wheel alignment. Please schedule immediately.`
            );
        } else {
            const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
            showLocalNotification(
                '🚛 Alignment Due Soon',
                `Truck ${label} is due for alignment in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`
            );
        }
    });
};
