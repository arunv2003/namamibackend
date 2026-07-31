import cron from "node-cron";
import attendanceService from "../services/attendance.service.js";

let cronTask = null;

export const initAttendanceCron = () => {
  if (cronTask) return;

  const appTimezone = process.env.APP_TIMEZONE || "Asia/Kolkata";
  console.log(`⏰ [ATTENDANCE CRON] Initialized daily absentee & unclosed punch auto-mark job for timezone: ${appTimezone}`);

  // Schedule to run every day at 23:59 (11:59 PM) in target timezone
  cronTask = cron.schedule(
    "59 23 * * *",
    async () => {
      try {
        console.log("⏰ [ATTENDANCE CRON] Running daily absentee & unclosed punch auto-marking task...");
        const result = await attendanceService.markDailyAbsentees();
        console.log("⏰ [ATTENDANCE CRON] Result:", result.message);
      } catch (err) {
        console.error("❌ [ATTENDANCE CRON] Error in attendance auto-marking cron job:", err.message);
      }
    },
    {
      scheduled: true,
      timezone: appTimezone,
    }
  );
};

export const stopAttendanceCron = () => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log("⏰ [ATTENDANCE CRON] Attendance cron job stopped.");
  }
};
