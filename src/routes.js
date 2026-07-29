import express from 'express';
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

const router = express.Router();

router.use('/upload', uploadRouter);
router.use('/employees', employeeRouter);
router.use('/roles', roleRouter);
router.use('/offices', officeRouter);
router.use('/customers', customerRouter);
router.use('/tasks', taskRouter);
router.use('/task-types', taskTypeRouter);
router.use('/complete-behalf', completeBehalfRouter);
router.use('/states', stateRouter);
router.use('/regions', regionRouter);
router.use('/branches', branchRouter);
router.use('/field-visits', fieldVisitRouter);
router.use('/attendance', attendanceRouter);

export default router;