import { holidaySchema } from "../models/holidays.model.js";
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

export const holidaysService = {
  createHoliday: async (data, userId) => {
    const existingName = await holidaySchema.findOne({
      where: { name: data.name },
    });
    if (existingName) {
      throw new ApiError(400, `Holiday with name '${data.name}' already exists`);
    }

    let slug = generateSlug(data.name || "holiday");
    let slugExists = await holidaySchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(data.name || "holiday");
      slugExists = await holidaySchema.findOne({ where: { slug } });
    }

    const holiday = await holidaySchema.create({
      ...data,
      slug,
      createdBy: userId || data.createdBy,
      updatedBy: userId || data.updatedBy,
    });

    const created = await holidaySchema.findByPk(holiday.id, {
      include: defaultIncludes,
    });

    return formatAudit(created);
  },

  getAllHolidays: async (queryParams = {}, userId, roleId) => {
    const { page = 1, limit = 10, search, flexible } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    const andConditions = [];

    if (flexible !== undefined) {
      where.flexible = flexible === "true" || flexible === true;
    }

    if (roleId) {
      const role = await RoleSchema.findByPk(roleId);
      const viewCondition = buildViewPermissionCondition(
        role,
        "leave",
        "holidays",
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

    const { count, rows } = await holidaySchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["startDate", "ASC"]],
      include: defaultIncludes,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      limit: parsedLimit,
      holidays: rows.map(formatAudit),
    };
  },

  getHolidayBySlug: async (identifier) => {
    let holiday;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      holiday = await holidaySchema.findByPk(identifier, {
        include: defaultIncludes,
      });
    } else {
      holiday = await holidaySchema.findOne({
        where: { slug: identifier },
        include: defaultIncludes,
      });
    }

    if (!holiday) {
      throw new ApiError(404, `Holiday with identifier '${identifier}' not found`);
    }

    return formatAudit(holiday);
  },

  updateHoliday: async (identifier, updateData, userId) => {
    let holiday;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      holiday = await holidaySchema.findByPk(identifier);
    } else {
      holiday = await holidaySchema.findOne({ where: { slug: identifier } });
    }

    if (!holiday) {
      throw new ApiError(404, `Holiday with identifier '${identifier}' not found`);
    }

    delete updateData.slug;
    const id = holiday.id;

    if (updateData.name && updateData.name !== holiday.name) {
      const nameExists = await holidaySchema.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(400, `Holiday with name '${updateData.name}' already exists`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await holiday.update(updateData);

    const updated = await holidaySchema.findByPk(id, {
      include: defaultIncludes,
    });
    return formatAudit(updated);
  },

  deleteHoliday: async (identifier) => {
    let holiday;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      holiday = await holidaySchema.findByPk(identifier);
    } else {
      holiday = await holidaySchema.findOne({ where: { slug: identifier } });
    }

    if (!holiday) {
      throw new ApiError(404, `Holiday with identifier '${identifier}' not found`);
    }

    await holiday.destroy();
    return true;
  },
};

export default holidaysService;
