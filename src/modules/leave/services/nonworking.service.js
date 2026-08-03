import { nonWorkingDaySchema } from "../models/nonworkingday.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { RoleSchema } from "../../roles/models/role.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
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

export const nonWorkingService = {
  createNonWorkingDay: async (data, userId) => {
    const nonWorkingDay = await nonWorkingDaySchema.create({
      ...data,
      createdBy: userId || data.createdBy,
      updatedBy: userId || data.updatedBy,
    });

    const created = await nonWorkingDaySchema.findByPk(nonWorkingDay.id, {
      include: defaultIncludes,
    });

    return formatAudit(created);
  },

  getAllNonWorkingDays: async (queryParams = {}, userId, roleId) => {
    const { page = 1, limit = 10, search, day, week } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    const andConditions = [];

    if (day) {
      where.day = day;
    }
    if (week) {
      where.week = week;
    }

    if (roleId) {
      const role = await RoleSchema.findByPk(roleId);
      const viewCondition = buildViewPermissionCondition(
        role,
        "leave",
        "nonworkingday",
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
          { day: { [Op.like]: `%${search}%` } },
          { week: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const { count, rows } = await nonWorkingDaySchema.findAndCountAll({
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
      nonWorkingDays: rows.map(formatAudit),
    };
  },

  getNonWorkingDayById: async (id) => {
    const nonWorkingDay = await nonWorkingDaySchema.findByPk(id, {
      include: defaultIncludes,
    });

    if (!nonWorkingDay) {
      throw new ApiError(404, `Non-working day with ID '${id}' not found`);
    }

    return formatAudit(nonWorkingDay);
  },

  updateNonWorkingDay: async (id, updateData, userId) => {
    const nonWorkingDay = await nonWorkingDaySchema.findByPk(id);

    if (!nonWorkingDay) {
      throw new ApiError(404, `Non-working day with ID '${id}' not found`);
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await nonWorkingDay.update(updateData);

    const updated = await nonWorkingDaySchema.findByPk(id, {
      include: defaultIncludes,
    });
    return formatAudit(updated);
  },

  deleteNonWorkingDay: async (id) => {
    const nonWorkingDay = await nonWorkingDaySchema.findByPk(id);

    if (!nonWorkingDay) {
      throw new ApiError(404, `Non-working day with ID '${id}' not found`);
    }

    await nonWorkingDay.destroy();
    return true;
  },
};

export default nonWorkingService;
