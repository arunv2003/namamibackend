import { taskTypeSchema } from "../models/task_type.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { Op } from "sequelize";

const defaultIncludes = [
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
  const item = typeof instance.toJSON === "function" ? instance.toJSON() : { ...instance };
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

export const taskTypeService = {
  createTaskType: async (data, userId) => {
    const existingName = await taskTypeSchema.findOne({
      where: { name: data.name },
    });
    if (existingName) {
      throw new ApiError(400, `Task type with name '${data.name}' already exists`);
    }

    let slug = generateSlug(data.name || "task-type");
    let slugExists = await taskTypeSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(data.name || "task-type");
      slugExists = await taskTypeSchema.findOne({ where: { slug } });
    }

    let task_type_id = generateUniqueId("TSKT");
    let taskTypeIdExists = await taskTypeSchema.findOne({ where: { task_type_id } });
    while (taskTypeIdExists) {
      task_type_id = generateUniqueId("TSKT");
      taskTypeIdExists = await taskTypeSchema.findOne({ where: { task_type_id } });
    }

    const taskType = await taskTypeSchema.create({
      ...data,
      task_type_id,
      slug,
      createdBy: userId || data.createdBy,
      updatedBy: userId || data.updatedBy,
    });

    const createdTaskType = await taskTypeSchema.findByPk(taskType.id, {
      include: defaultIncludes,
    });

    return formatAudit(createdTaskType);
  },

  getAllTaskTypes: async (queryParams = {}) => {
    const { page = 1, limit = 10, search } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await taskTypeSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: defaultIncludes,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      taskTypes: rows.map(formatAudit),
    };
  },

  getTaskTypeBySlug: async (identifier) => {
    let taskType;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      taskType = await taskTypeSchema.findByPk(identifier, {
        include: defaultIncludes,
      });
    } else {
      taskType = await taskTypeSchema.findOne({
        where: { slug: identifier },
        include: defaultIncludes,
      });
    }

    if (!taskType) {
      throw new ApiError(404, `Task type with identifier '${identifier}' not found`);
    }

    return formatAudit(taskType);
  },

  updateTaskType: async (identifier, updateData, userId) => {
    let taskType;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      taskType = await taskTypeSchema.findByPk(identifier);
    } else {
      taskType = await taskTypeSchema.findOne({ where: { slug: identifier } });
    }

    if (!taskType) {
      throw new ApiError(404, `Task type with identifier '${identifier}' not found`);
    }

    delete updateData.slug;
    const id = taskType.id;

    if (updateData.name && updateData.name !== taskType.name) {
      const nameExists = await taskTypeSchema.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(400, `Task type with name '${updateData.name}' already exists`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await taskType.update(updateData);

    const updatedTaskType = await taskTypeSchema.findByPk(id, {
      include: defaultIncludes,
    });
    return formatAudit(updatedTaskType);
  },

  deleteTaskType: async (identifier) => {
    let taskType;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      taskType = await taskTypeSchema.findByPk(identifier);
    } else {
      taskType = await taskTypeSchema.findOne({ where: { slug: identifier } });
    }

    if (!taskType) {
      throw new ApiError(404, `Task type with identifier '${identifier}' not found`);
    }

    await taskType.destroy();
    return true;
  },
};

export default taskTypeService;
