import express from 'express';
import { createRouteLimiter } from './core/middleware/security.js';
import employeeRouter from './modules/employees/routes/employee.routes.js';
import roleRouter from './modules/roles/routes/role.route.js';
import officeRouter from './modules/office/routes/office.routes.js';
import customerRouter from './modules/customer/routes/customer.routes.js';
import taskRouter from './modules/tasks/routes/task.routes.js';
import taskTypeRouter from './modules/tasks/routes/task.type.route.js';
import completeBehalfRouter from './modules/tasks/routes/completebehalf.route.js';
import stateRouter from './modules/state/routes/state.routes.js';
import regionRouter from './modules/state/routes/region.routes.js';
import branchRouter from './modules/state/routes/branch.routes.js';
import fieldVisitRouter from './modules/fieldvisit/routes/fieldvisit.routes.js';
import attendanceRouter from './modules/attendance/routes/attendance.routes.js';
import uploadRouter from './modules/upload/routes/upload.routes.js';
import leaveTypeRouter from './modules/leave/routes/leave.type.route.js';
import leaveRouter from './modules/leave/routes/leave.route.js';
import leaveProfileRouter from './modules/leave/routes/leaveprofile.route.js';
import holidaysRouter from './modules/leave/routes/holidays.route.js';
import nonWorkingDayRouter from './modules/leave/routes/nonworking.route.js';
import dashboardRouter from './modules/dashboard/routes/dashboard.routes.js';

const router = express.Router();

// ─── Per-Route Rate Limiters ──────────────────────────────────────────────────
// createRouteLimiter(maxRequests, windowMinutes, routeName)

const uploadLimiter      = createRouteLimiter(5,  1, 'upload');           // strict - file flood rokna
const dashboardLimiter   = createRouteLimiter(20, 1, 'dashboard');        // multiple widgets load karta hai
const employeeLimiter    = createRouteLimiter(20, 1, 'employees');        // list + detail dono
const roleLimiter        = createRouteLimiter(30, 1, 'roles');            // rarely changes
const officeLimiter      = createRouteLimiter(30, 1, 'offices');          // rarely changes
const customerLimiter    = createRouteLimiter(20, 1, 'customers');
const taskLimiter        = createRouteLimiter(20, 1, 'tasks');
const taskTypeLimiter    = createRouteLimiter(30, 1, 'task-types');       // almost static data
const completeBehalfLimiter = createRouteLimiter(10, 1, 'complete-behalf'); // action endpoint - strict
const stateLimiter       = createRouteLimiter(30, 1, 'states');           // static master data
const regionLimiter      = createRouteLimiter(30, 1, 'regions');          // static master data
const branchLimiter      = createRouteLimiter(30, 1, 'branches');         // static master data
const fieldVisitLimiter  = createRouteLimiter(20, 1, 'field-visits');
const attendanceLimiter  = createRouteLimiter(15, 1, 'attendance');
const leaveTypeLimiter   = createRouteLimiter(30, 1, 'leave-types');      // static master data
const leaveLimiter       = createRouteLimiter(15, 1, 'leaves');
const leaveProfileLimiter = createRouteLimiter(30, 1, 'leave-profiles');  // static master data
const holidayLimiter     = createRouteLimiter(30, 1, 'holidays');         // static master data
const nonWorkingDayLimiter = createRouteLimiter(30, 1, 'non-working-days'); // static master data

// ─── Routes ───────────────────────────────────────────────────────────────────

router.use('/upload',           uploadLimiter,          uploadRouter);
router.use('/dashboard',        dashboardLimiter,        dashboardRouter);
router.use('/employees',        employeeLimiter,         employeeRouter);
router.use('/roles',            roleLimiter,             roleRouter);
router.use('/offices',          officeLimiter,           officeRouter);
router.use('/customers',        customerLimiter,         customerRouter);
router.use('/tasks',            taskLimiter,             taskRouter);
router.use('/task-types',       taskTypeLimiter,         taskTypeRouter);
router.use('/complete-behalf',  completeBehalfLimiter,   completeBehalfRouter);
router.use('/states',           stateLimiter,            stateRouter);
router.use('/regions',          regionLimiter,           regionRouter);
router.use('/branches',         branchLimiter,           branchRouter);
router.use('/field-visits',     fieldVisitLimiter,       fieldVisitRouter);
router.use('/attendance',       attendanceLimiter,       attendanceRouter);
router.use('/leave-types',      leaveTypeLimiter,        leaveTypeRouter);
router.use('/leaves',           leaveLimiter,            leaveRouter);
router.use('/leave-profiles',   leaveProfileLimiter,     leaveProfileRouter);
router.use('/holidays',         holidayLimiter,          holidaysRouter);
router.use('/non-working-days', nonWorkingDayLimiter,    nonWorkingDayRouter);

export default router;