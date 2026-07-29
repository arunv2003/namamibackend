import attendanceService from "../services/attendance.service.js";

let intervalId = null;

export const initAttendanceCron = () => {
  if (intervalId) return;

  console.log("⏰ [ATTENDANCE CRON] Initialized daily absentee auto-mark background job.");

  // Check every 15 minutes if it is end of day (23:45 - 23:59)
  intervalId = setInterval(async () => {
    try {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Trigger auto-absent marking between 23:45 and 23:59
      if (hours === 23 && minutes >= 45) {
        console.log("⏰ [ATTENDANCE CRON] Running daily absentee auto-marking task...");
        const result = await attendanceService.markDailyAbsentees();
        console.log("⏰ [ATTENDANCE CRON] Result:", result.message);
      }
    } catch (err) {
      console.error("❌ [ATTENDANCE CRON] Error in absentee auto-marking cron job:", err.message);
    }
  }, 15 * 60 * 1000);
};

export const stopAttendanceCron = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
