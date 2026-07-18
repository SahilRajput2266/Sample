import dotenv from 'dotenv';
dotenv.config();

const { default: connectDB } = await import('./config/db.js');
const { default: app } = await import('./app.js');
const { startAutomationWorker, stopAutomationWorker } = await import('./workers/automation.worker.js');
const { startAutomationMaintenance, stopAutomationMaintenance } = await import('./schedulers/automation-maintenance.scheduler.js');
const { closeAutomationQueue } = await import('./queues/automation.queue.js');
const { closeAllBrowserSessions } = await import('./services/automation/playwright-browser.service.js');
const { default: mongoose } = await import('mongoose');
const { startNotificationWorker, stopNotificationWorker } = await import('./workers/notification.worker.js');
const { startNotificationScheduler, stopNotificationScheduler } = await import('./schedulers/notification.scheduler.js');
const { closeNotificationQueue } = await import('./queues/notification.queue.js');

await connectDB();
startAutomationWorker();
startAutomationMaintenance();
startNotificationWorker();
startNotificationScheduler();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const shutdown = async () => {
  stopAutomationMaintenance();
  stopNotificationScheduler();
  await Promise.allSettled([stopAutomationWorker(), closeAutomationQueue(), closeAllBrowserSessions(), stopNotificationWorker(), closeNotificationQueue()]);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);