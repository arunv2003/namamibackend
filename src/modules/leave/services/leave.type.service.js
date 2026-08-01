import { leaveTypeSchema } from "../models/leave.type.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { RoleSchema } from "../../roles/models/role.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { buildViewPermissionCondition } from "../../../core/utils/permission.utils.js";
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

export const leaveTypeService = {
  createLeaveType: async (data, userId) => {
    const existingName = await leaveTypeSchema.findOne({
      where: { name: data.name },
    });
    if (existingName) {
      throw new ApiError(400, `Leave type with name '${data.name}' already exists`);
    }

    let slug = generateSlug(data.name || "leave-type");
    let slugExists = await leaveTypeSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(data.name || "leave-type");
      slugExists = await leaveTypeSchema.findOne({ where: { slug } });
    }

    const leaveType = await leaveTypeSchema.create({
      ...data,
      slug,
      createdBy: userId || data.createdBy,
      updatedBy: userId || data.updatedBy,
    });

    const createdLeaveType = await leaveTypeSchema.findByPk(leaveType.id, {
      include: defaultIncludes,
    });

    return formatAudit(createdLeaveType);
  },

  getAllLeaveTypes: async (queryParams = {}, userId, roleId) => {
    const { page = 1, limit = 10, search, status } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    const andConditions = [];

    if (status) {
      where.status = status;
    }

    if (roleId) {
      const role = await RoleSchema.findByPk(roleId);
      const viewCondition = buildViewPermissionCondition(
        role,
        "leave",
        "leavetype",
        userId,
        ["createdBy"]
      );
      if (viewCondition) {
        andConditions.push(viewCondition);
      }
    }

    if (search) {
      andConditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const { count, rows } = await leaveTypeSchema.findAndCountAll({
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
      limit: parsedLimit,
      leaveTypes: rows.map(formatAudit),
    };
  },

  getLeaveTypeBySlug: async (identifier) => {
    let leaveType;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      leaveType = await leaveTypeSchema.findByPk(identifier, {
        include: defaultIncludes,
      });
    } else {
      leaveType = await leaveTypeSchema.findOne({
        where: { slug: identifier },
        include: defaultIncludes,
      });
    }

    if (!leaveType) {
      throw new ApiError(404, `Leave type with identifier '${identifier}' not found`);
    }

    return formatAudit(leaveType);
  },

  updateLeaveType: async (identifier, updateData, userId) => {
    let leaveType;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      leaveType = await leaveTypeSchema.findByPk(identifier);
    } else {
      leaveType = await leaveTypeSchema.findOne({ where: { slug: identifier } });
    }

    if (!leaveType) {
      throw new ApiError(404, `Leave type with identifier '${identifier}' not found`);
    }

    // Do NOT allow updating slug
    delete updateData.slug;
    const id = leaveType.id;

    if (updateData.name && updateData.name !== leaveType.name) {
      const nameExists = await leaveTypeSchema.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(400, `Leave type with name '${updateData.name}' already exists`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await leaveType.update(updateData);

    const updatedLeaveType = await leaveTypeSchema.findByPk(id, {
      include: defaultIncludes,
    });
    return formatAudit(updatedLeaveType);
  },

  deleteLeaveType: async (identifier) => {
    let leaveType;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      leaveType = await leaveTypeSchema.findByPk(identifier);
    } else {
      leaveType = await leaveTypeSchema.findOne({ where: { slug: identifier } });
    }

    if (!leaveType) {
      throw new ApiError(404, `Leave type with identifier '${identifier}' not found`);
    }

    await leaveType.destroy();
    return true;
  },
};

export default leaveTypeService;
