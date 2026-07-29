import { employeeSchema } from "../../modules/employees/models/employee.model.js";
import { RoleSchema } from "../../modules/roles/models/role.model.js";
import { officeSchema } from "../../modules/office/models/office.models.js";
import { customerSchema } from "../../modules/customer/models/customer.model.js";
import { taskSchema } from "../../modules/tasks/models/task.model.js";
import { taskTypeSchema } from "../../modules/tasks/models/task_type.model.js";
import { stateSchema } from "../../modules/state/models/state.model.js";
import { regionSchema } from "../../modules/state/models/region.model.js";
import { branchSchema } from "../../modules/state/models/branch.model.js";
import { attendanceSchema } from "../../modules/attendance/models/attendance.model.js";
import { setupAssociations } from "./associations.js";

// Ensure associations are initialized as soon as models are imported
setupAssociations();

export {
  employeeSchema,
  RoleSchema,
  officeSchema,
  customerSchema,
  taskSchema,
  taskTypeSchema,
  stateSchema,
  regionSchema,
  branchSchema,
  attendanceSchema,
  setupAssociations,
};
