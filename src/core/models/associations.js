import { employeeSchema } from "../../modules/employees/models/employee.model.js";
import { RoleSchema } from "../../modules/roles/models/role.model.js";
import { customerSchema } from "../../modules/customer/models/customer.model.js";
import { officeSchema } from "../../modules/office/models/office.models.js";
import { taskSchema } from "../../modules/tasks/models/task.model.js";
import { taskTypeSchema } from "../../modules/tasks/models/task_type.model.js";
import { stateSchema } from "../../modules/state/models/state.model.js";
import { regionSchema } from "../../modules/state/models/region.model.js";
import { branchSchema } from "../../modules/state/models/branch.model.js";
import { attendanceSchema } from "../../modules/attendance/models/attendance.model.js";
import { fieldSchema } from "../../modules/fieldvisit/models/fieldvisit.model.js";
import { leaveTypeSchema } from "../../modules/leave/models/leave.type.model.js";
import { leaveSchema } from "../../modules/leave/models/leave.model.js";

let isAssociationsSetup = false;

export const setupAssociations = () => {
  if (isAssociationsSetup) return;
  isAssociationsSetup = true;

  // Remove auto-inferred role_id attribute if injected prematurely by Sequelize
  if (employeeSchema.rawAttributes && employeeSchema.rawAttributes.role_id) {
    delete employeeSchema.rawAttributes.role_id;
  }

  // 1. Role <-> Employee
  RoleSchema.hasMany(employeeSchema, { foreignKey: "type", as: "employees", constraints: false });
  employeeSchema.belongsTo(RoleSchema, { foreignKey: "type", as: "role", constraints: false });

  // Role Audit Trail (CreatedBy & UpdatedBy)
  RoleSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  RoleSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });

  // 2. Employee <-> Employee (Manager / Subordinates)
  employeeSchema.belongsTo(employeeSchema, { foreignKey: "manager_id", as: "manager", constraints: false });
  employeeSchema.hasMany(employeeSchema, { foreignKey: "manager_id", as: "subordinates", constraints: false });

  // Employee Audit Trail (CreatedBy & UpdatedBy)
  employeeSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  employeeSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });

  // Employee <-> State / Region / Branch
  employeeSchema.belongsTo(stateSchema, { foreignKey: "state_id", as: "state", constraints: false });
  employeeSchema.belongsTo(regionSchema, { foreignKey: "region_id", as: "region", constraints: false });
  employeeSchema.belongsTo(branchSchema, { foreignKey: "branch_id", as: "branch", constraints: false });
  stateSchema.hasMany(employeeSchema, { foreignKey: "state_id", as: "stateEmployees", constraints: false });
  regionSchema.hasMany(employeeSchema, { foreignKey: "region_id", as: "regionEmployees", constraints: false });
  branchSchema.hasMany(employeeSchema, { foreignKey: "branch_id", as: "branchEmployees", constraints: false });

  // 3. Office <-> State / Region / Branch
  officeSchema.belongsTo(stateSchema, { foreignKey: "state_id", as: "state", constraints: false });
  officeSchema.belongsTo(regionSchema, { foreignKey: "region_id", as: "region", constraints: false });
  officeSchema.belongsTo(branchSchema, { foreignKey: "branch_id", as: "branch", constraints: false });
  stateSchema.hasMany(officeSchema, { foreignKey: "state_id", as: "offices", constraints: false });
  regionSchema.hasMany(officeSchema, { foreignKey: "region_id", as: "offices", constraints: false });
  branchSchema.hasMany(officeSchema, { foreignKey: "branch_id", as: "offices", constraints: false });

  // Office Audit Trail (CreatedBy & UpdatedBy)
  officeSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  officeSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });

  // 4. State / Region / Branch Hierarchy & Audit Trail
  stateSchema.hasMany(regionSchema, { foreignKey: "state_id", as: "regionsList", constraints: false });
  regionSchema.belongsTo(stateSchema, { foreignKey: "state_id", as: "state", constraints: false });

  regionSchema.hasMany(branchSchema, { foreignKey: "region_id", as: "branches", constraints: false });
  branchSchema.belongsTo(regionSchema, { foreignKey: "region_id", as: "region", constraints: false });
  branchSchema.belongsTo(stateSchema, { foreignKey: "state_id", as: "state", constraints: false });

  stateSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  stateSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });
  regionSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  regionSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });
  branchSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  branchSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });

  // 5. Customer Audit Trail & Owner
  customerSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  customerSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });
  customerSchema.belongsTo(employeeSchema, { foreignKey: "owner", as: "ownerDetails", constraints: false });
  employeeSchema.hasMany(customerSchema, { foreignKey: "owner", as: "ownedCustomers", constraints: false });

  // 6. Task <-> TaskType
  taskSchema.belongsTo(taskTypeSchema, { foreignKey: "taskType", as: "typeDetails", constraints: false });
  taskTypeSchema.hasMany(taskSchema, { foreignKey: "taskType", as: "tasks", constraints: false });
  taskTypeSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  taskTypeSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });

  // 7. Task <-> Customer
  customerSchema.hasMany(taskSchema, { foreignKey: "customerId", as: "tasks", constraints: false });
  taskSchema.belongsTo(customerSchema, { foreignKey: "customerId", as: "customer", constraints: false });

  // 8. Task <-> Employee (Assignee)
  employeeSchema.hasMany(taskSchema, { foreignKey: "assigneeToEmployeeId", as: "assignedTasks", constraints: false });
  taskSchema.belongsTo(employeeSchema, { foreignKey: "assigneeToEmployeeId", as: "assignee", constraints: false });

  // 9. Task Audit Trail (CreatedBy & UpdatedBy)
  taskSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  taskSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });

  // 10. Attendance <-> Employee & Office
  attendanceSchema.belongsTo(employeeSchema, { foreignKey: "employee_id", as: "employee", constraints: false });
  employeeSchema.hasMany(attendanceSchema, { foreignKey: "employee_id", as: "attendances", constraints: false });
  attendanceSchema.belongsTo(officeSchema, { foreignKey: "punchinOffice", as: "punchInOffice", constraints: false });
  attendanceSchema.belongsTo(officeSchema, { foreignKey: "punchoutOffice", as: "punchOutOffice", constraints: false });

  // 11. FieldVisit <-> Employee & Customer
  fieldSchema.belongsTo(customerSchema, { foreignKey: "customerId", as: "customer", constraints: false });
  customerSchema.hasMany(fieldSchema, { foreignKey: "customerId", as: "fieldVisits", constraints: false });

  // 12. LeaveType Audit Trail
  leaveTypeSchema.belongsTo(employeeSchema, { foreignKey: "createdBy", as: "creator", constraints: false });
  leaveTypeSchema.belongsTo(employeeSchema, { foreignKey: "updatedBy", as: "updater", constraints: false });

  // 13. Leave <-> Employee, LeaveType & ActionBy
  leaveSchema.belongsTo(employeeSchema, { foreignKey: "emp_id", as: "employee", constraints: false });
  employeeSchema.hasMany(leaveSchema, { foreignKey: "emp_id", as: "leaves", constraints: false });
  leaveSchema.belongsTo(leaveTypeSchema, { foreignKey: "leave_type_id", as: "leaveType", constraints: false });
  leaveTypeSchema.hasMany(leaveSchema, { foreignKey: "leave_type_id", as: "leaves", constraints: false });
  leaveSchema.belongsTo(employeeSchema, { foreignKey: "actionBy", as: "actionByEmployee", constraints: false });
};

// Auto-initialize associations on module import
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
  fieldSchema,
  leaveTypeSchema,
  leaveSchema,
};

