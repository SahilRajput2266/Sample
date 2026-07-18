import dotenv from 'dotenv';
dotenv.config();

const { default: connectDB } = await import('./config/db.js');
const { default: app } = await import('./app.js');
const { startAutomationWorker, stopAutomationWorker } = await import('./workers/automation.worker.js');
const { startAutomationMaintenance, stopAutomationMaintenance } = await import('./schedulers/automation-maintenance.scheduler.js');
const { closeAutomationQueue } = await import('./queues/automation.queue.js');
const { closeAllBrowserSessions } = await import('./services/automation/playwright-browser.service.js');
const { default: mongoose } = await import('mongoose');

await connectDB();
startAutomationWorker();
startAutomationMaintenance();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const shutdown = async () => {
  stopAutomationMaintenance();
  await Promise.allSettled([stopAutomationWorker(), closeAutomationQueue(), closeAllBrowserSessions()]);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);