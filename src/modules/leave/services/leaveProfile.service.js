import { leaveProfileSchema } from "../models/leaveProfile.model.js";
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

export const leaveProfileService = {
  createLeaveProfile: async (data, userId) => {
    const existingName = await leaveProfileSchema.findOne({
      where: { name: data.name },
    });
    if (existingName) {
      throw new ApiError(400, `Leave profile with name '${data.name}' already exists`);
    }

    let slug = generateSlug(data.name || "leave-profile");
    let slugExists = await leaveProfileSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(data.name || "leave-profile");
      slugExists = await leaveProfileSchema.findOne({ where: { slug } });
    }

    const leaveProfile = await leaveProfileSchema.create({
      ...data,
      slug,
      createdBy: userId || data.createdBy,
      updatedBy: userId || data.updatedBy,
    });

    const created = await leaveProfileSchema.findByPk(leaveProfile.id, {
      include: defaultIncludes,
    });

    return formatAudit(created);
  },

  getAllLeaveProfiles: async (queryParams = {}, userId, roleId) => {
    const { page = 1, limit = 10, search } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    const andConditions = [];

    if (roleId) {
      const role = await RoleSchema.findByPk(roleId);
      const viewCondition = buildViewPermissionCondition(
        role,
        "leave",
        "leaveprofile",
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

    const { count, rows } = await leaveProfileSchema.findAndCountAll({
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
      leaveProfiles: rows.map(formatAudit),
    };
  },

  getLeaveProfileBySlug: async (identifier) => {
    let leaveProfile;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      leaveProfile = await leaveProfileSchema.findByPk(identifier, {
        include: defaultIncludes,
      });
    } else {
      leaveProfile = await leaveProfileSchema.findOne({
        where: { slug: identifier },
        include: defaultIncludes,
      });
    }

    if (!leaveProfile) {
      throw new ApiError(404, `Leave profile with identifier '${identifier}' not found`);
    }

    return formatAudit(leaveProfile);
  },

  updateLeaveProfile: async (identifier, updateData, userId) => {
    let leaveProfile;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      leaveProfile = await leaveProfileSchema.findByPk(identifier);
    } else {
      leaveProfile = await leaveProfileSchema.findOne({ where: { slug: identifier } });
    }

    if (!leaveProfile) {
      throw new ApiError(404, `Leave profile with identifier '${identifier}' not found`);
    }

    delete updateData.slug;
    const id = leaveProfile.id;

    if (updateData.name && updateData.name !== leaveProfile.name) {
      const nameExists = await leaveProfileSchema.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(400, `Leave profile with name '${updateData.name}' already exists`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await leaveProfile.update(updateData);

    const updated = await leaveProfileSchema.findByPk(id, {
      include: defaultIncludes,
    });
    return formatAudit(updated);
  },

  deleteLeaveProfile: async (identifier) => {
    let leaveProfile;
    const isId = !isNaN(identifier) && !isNaN(parseFloat(identifier));

    if (isId) {
      leaveProfile = await leaveProfileSchema.findByPk(identifier);
    } else {
      leaveProfile = await leaveProfileSchema.findOne({ where: { slug: identifier } });
    }

    if (!leaveProfile) {
      throw new ApiError(404, `Leave profile with identifier '${identifier}' not found`);
    }

    await leaveProfile.destroy();
    return true;
  },
};

export default leaveProfileService;
