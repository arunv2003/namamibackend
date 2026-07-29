import {
  taskSchema,
  taskTypeSchema,
  customerSchema,
  employeeSchema,
  RoleSchema,
} from "../../../core/models/index.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { Op } from "sequelize";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";

const includeOptions = [
  {
    model: taskTypeSchema,
    as: "typeDetails",
    attributes: ["id", "name", "slug"],
  },
  {
    model: customerSchema,
    as: "customer",
    attributes: [
      "id",
      "customer_id",
      "name",
      "email",
      "phone",
      "slug",
      "location",
      "district",
      "state",
      "sub_state",
      "branch_code",
      "branch",
      "center",
      "center_code",
      "loanType",
      "loanNo",
      "oldLoanNo",
      "loanAmount",
      "os_principal",
      "os_interest",
      "par",
      "od_principal",
      "od_interest",
      "totalDueAmount",
      "total_principal_collectible",
      "total_interest_collectible",
      "irrRate",
      "noOfInstallment",
      "dpd",
      "paidInstNo",
      "loanStatus",
      "spouseName",
      "installmentAmount",
      "pincode",
    ],
  },
  {
    model: employeeSchema,
    as: "assignee",
    attributes: ["id", "name", "identity", "email", "mobile"],
  },
  {
    model: employeeSchema,
    as: "creator",
    attributes: ["id", "name", "identity"],
  },
  {
    model: employeeSchema,
    as: "updater",
    attributes: ["id", "name", "identity"],
  },
];

const formatAudit = (instance) => {
  if (!instance) return instance;
  const item =
    typeof instance.toJSON === "function" ? instance.toJSON() : { ...instance };
  if (item.typeDetails !== undefined) {
    item.taskType = item.typeDetails;
    delete item.typeDetails;
  }
  if (item.customer !== undefined) {
    item.customerId = item.customer;
    delete item.customer;
  }
  if (item.assignee !== undefined) {
    item.assigneeToEmployeeId = item.assignee;
    delete item.assignee;
  }
  if (item.creator !== undefined) {
    item.createdBy = item.creator;
    delete item.creator;
  }
  if (item.updater !== undefined) {
    item.updatedBy = item.updater;
    delete item.updater;
  }
  return item;
};

export const taskService = {
  getCreateTaskForm: async (roleSlug) => {
    const isEmployee =
      roleSlug && String(roleSlug).toLowerCase() === "employee";

    const baseFields = [
      {
        name: "taskType",
        label: "Task Type",
        type: "text",
        placeholder: "Enter task type",
        required: true,
      },
      {
        name: "customerId",
        label: "Customer ID",
        type: "number",
        placeholder: "Enter customer ID",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter description",
        required: true,
      },
      {
        name: "payment_type",
        label: "Payment Amount",
        type: "number",
        placeholder: "Enter payment amount",
        required: false,
      },
    ];

    if (isEmployee) {
      return {
        title: "Task Form",
        fields: baseFields,
      };
    }

    const fullFields = [
      ...baseFields,
      {
        name: "priority",
        label: "Priority",
        type: "select",
        required: false,
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
          { label: "Urgent", value: "urgent" },
        ],
      },
      {
        name: "assigneeToEmployeeId",
        label: "Assignee Employee ID",
        type: "number",
        placeholder: "Enter assignee employee ID",
        required: false,
      },
      {
        name: "startDateTime",
        label: "Start Date & Time",
        type: "datetime-local",
        required: false,
      },
      {
        name: "endDateTime",
        label: "End Date & Time",
        type: "datetime-local",
        required: false,
      },
      {
        name: "repeat",
        label: "Repeat Task",
        type: "checkbox",
        required: false,
      },
      {
        name: "frequency",
        label: "Frequency",
        type: "select",
        required: false,
        options: [
          { label: "Hour", value: "hour" },
          { label: "Day", value: "day" },
          { label: "Week", value: "week" },
          { label: "Month", value: "month" },
          { label: "Year", value: "year" },
        ],
      },
      {
        name: "interval",
        label: "Interval",
        type: "number",
        placeholder: "Enter interval",
        required: false,
      },
      {
        name: "time",
        label: "Time",
        type: "time",
        required: false,
      },
      {
        name: "payment_type",
        label: "Payment Amount",
        type: "number",
        placeholder: "Enter payment amount",
        required: false,
      },
    ];

    return {
      title: "Task Form",
      fields: fullFields,
    };
  },

  createTask: async (taskData, userId) => {
    if (taskData.customerId) {
      const customer = await customerSchema.findByPk(taskData.customerId);
      if (!customer) {
        throw new ApiError(
          404,
          `Customer with ID '${taskData.customerId}' not found`,
        );
      }
    }

    if (taskData.assigneeToEmployeeId) {
      const assignee = await employeeSchema.findByPk(
        taskData.assigneeToEmployeeId,
      );

      if (!assignee) {
        throw new ApiError(
          404,
          `Employee with ID '${taskData.assigneeToEmployeeId}' not found`,
        );
      }
    }

    let slug = generateSlug(taskData.description || "task");
    let slugExists = await taskSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(taskData.description || "task");
      slugExists = await taskSchema.findOne({ where: { slug } });
    }

    let task_id = generateUniqueId("TSK");
    let taskIdExists = await taskSchema.findOne({ where: { task_id } });
    while (taskIdExists) {
      task_id = generateUniqueId("TSK");
      taskIdExists = await taskSchema.findOne({ where: { task_id } });
    }

    const task = await taskSchema.create({
      ...taskData,
      task_id,
      slug,
      status: "pending",
      createdBy: userId || taskData.createdBy,
      updatedBy: userId || taskData.updatedBy,
    });

    const createdTask = await taskSchema.findByPk(task.id, {
      include: includeOptions,
    });
    return formatAudit(createdTask);
  },

  getAllTasks: async (queryParams, userId, roleId) => {
    const {
      page = 1,
      limit = 10,
      search,
      taskType,
      priority,
      customerId,
      status,
      assigneeToEmployeeId,
    } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;
    const role = await RoleSchema.findByPk(roleId);

    const where = {};
    const andConditions = [];

    if (search) {
      andConditions.push({
        [Op.or]: [
          { taskType: { [Op.like]: `%${search}%` } },
          { priority: { [Op.like]: `%${search}%` } },
          { status: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (role?.slug !== "admin") {
      andConditions.push({
        [Op.or]: [
          { createdBy: userId },
          { assigneeToEmployeeId: userId },
        ],
      });
    }

    if (taskType) {
      where.taskType = taskType;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (assigneeToEmployeeId) {
      where.assigneeToEmployeeId = assigneeToEmployeeId;
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const { count, rows } = await taskSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: includeOptions,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      tasks: rows.map(formatAudit),
    };
  },

  getAllTaskByEmployeeId:async()=>{

  },


  getTaskBySlug: async (slug) => {
    console.log(slug,"slugslugslugslug")
    let task;
    if (!isNaN(slug)) {
      task = await taskSchema.findByPk(slug, { include: includeOptions });
      if (!task) {
        task = await taskSchema.findOne({
          where: {
            [Op.or]: [{ slug: slug }, { task_id: slug }],
          },
          include: includeOptions,
        });
      }
    } else {
      task = await taskSchema.findOne({
        where: {
          [Op.or]: [{ slug: slug }, { task_id: slug }],
        },
        include: includeOptions,
      });
    }

    if (!task) {
      throw new ApiError(404, `Task '${slug}' not found`);
    }

    return formatAudit(task);
  },

  getCustomerTasks: async (queryParams = {}, user = {}) => {
    const { id } = user || {};
    const { page = 1, limit = 10, search, status, priority, taskType } = queryParams;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    const andConditions = [];

    if (id) {
      where.createdBy = id;
    }

    if (search) {
      andConditions.push({
        [Op.or]: [
          { taskType: { [Op.like]: `%${search}%` } },
          { priority: { [Op.like]: `%${search}%` } },
          { status: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (taskType) {
      where.taskType = taskType;
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const { count, rows } = await taskSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: includeOptions,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      tasks: rows.map(formatAudit),
    };
  },

  getEmployeeTasks: async (employeeId, queryParams = {}) => {
    const { page = 1, limit = 10 } = queryParams;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    let employeeExists = await employeeSchema.findByPk(employeeId);
    if (!employeeExists && !isNaN(Number(employeeId))) {
      employeeExists = await employeeSchema.findOne({ where: { emp_id: Number(employeeId) } });
    }

    if (!employeeExists) {
      return {
        totalItems: 0,
        totalPages: 0,
        currentPage: parsedPage,
        tasks: [],
      };
    }

    const actualEmpId = employeeExists.id;

    const { count, rows } = await taskSchema.findAndCountAll({
      where: {
        [Op.or]: [
          { assigneeToEmployeeId: actualEmpId },
          { createdBy: actualEmpId },
        ],
      },
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: includeOptions,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      tasks: rows.map(formatAudit),
    };
  },

  updateTask: async (identifier, updateData, userId) => {
    let task;
    if (!isNaN(identifier)) {
      task = await taskSchema.findByPk(identifier);
    } else {
      task = await taskSchema.findOne({ where: { slug: identifier } });
    }

    if (!task) {
      throw new ApiError(404, `Task '${identifier}' not found`);
    }

    if (updateData.customerId && updateData.customerId !== task.customerId) {
      const customer = await customerSchema.findByPk(updateData.customerId);
      if (!customer) {
        throw new ApiError(
          404,
          `Customer with ID '${updateData.customerId}' not found`,
        );
      }
    }

    if (
      updateData.assigneeToEmployeeId &&
      updateData.assigneeToEmployeeId !== task.assigneeToEmployeeId
    ) {
      const assignee = await employeeSchema.findByPk(
        updateData.assigneeToEmployeeId,
      );
      if (!assignee) {
        throw new ApiError(
          404,
          `Employee with ID '${updateData.assigneeToEmployeeId}' not found`,
        );
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await task.update(updateData);

    const updatedTask = await taskSchema.findByPk(task.id, {
      include: includeOptions,
    });
    return formatAudit(updatedTask);
  },

  deleteTask: async (identifier) => {
    let task;
    if (!isNaN(identifier)) {
      task = await taskSchema.findByPk(identifier);
    } else {
      task = await taskSchema.findOne({ where: { slug: identifier } });
    }

    if (!task) {
      throw new ApiError(404, `Task '${identifier}' not found`);
    }

    await task.destroy();
    return true;
  },
};

export default taskService;
