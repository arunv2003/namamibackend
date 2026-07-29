import { RoleSchema } from "../models/role.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { Op } from "sequelize";

const defaultRoleIncludes = [
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

export const roleService = {
  createRole: async (roleData, userId) => {
    // 1. Check if role with same name already exists
    const existingName = await RoleSchema.findOne({
      where: { name: roleData.name },
    });
    if (existingName) {
      throw new ApiError(
        400,
        `Role with name '${roleData.name}' already exists`,
      );
    }

    // Generate unique slug
    let slug = generateSlug(roleData.name);
    let slugExists = await RoleSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(roleData.name);
      slugExists = await RoleSchema.findOne({ where: { slug } });
    }

    // Save to database
    const role = await RoleSchema.create({
      ...roleData,
      slug,
      createdBy: userId || roleData.createdBy,
      updatedBy: userId || roleData.updatedBy,
    });

    const createdRole = await RoleSchema.findByPk(role.id, {
      include: defaultRoleIncludes,
    });
    return formatAudit(createdRole);
  },

  getRoles: async (queryParams) => {
    const { search, status } = queryParams;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await RoleSchema.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      include: defaultRoleIncludes,
    });

    return {
      totalItems: count,
      roles: rows.map(formatAudit),
    };
  },

  getRoleBySlug: async (slug) => {
    let role;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      role = await RoleSchema.findByPk(slug, {
        include: defaultRoleIncludes,
      });
    } else {
      role = await RoleSchema.findOne({
        where: { slug },
        include: defaultRoleIncludes,
      });
    }

    if (!role) {
      throw new ApiError(404, `Role with identifier '${slug}' not found`);
    }

    return formatAudit(role);
  },

  updateRole: async (slug, updateData, userId) => {
    let role;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      role = await RoleSchema.findByPk(slug);
    } else {
      role = await RoleSchema.findOne({ where: { slug } });
    }

    if (!role) {
      throw new ApiError(404, `Role with identifier '${slug}' not found`);
    }

    delete updateData.slug;
    const id = role.id;

    // If name is updating, check for name conflict
    if (updateData.name && updateData.name !== role.name) {
      const nameExists = await RoleSchema.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(
          400,
          `Role with name '${updateData.name}' already exists`,
        );
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await role.update(updateData);

    const updatedRole = await RoleSchema.findByPk(id, {
      include: defaultRoleIncludes,
    });
    return formatAudit(updatedRole);
  },

  deleteRole: async (slug) => {
    let role;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      role = await RoleSchema.findByPk(slug);
    } else {
      role = await RoleSchema.findOne({ where: { slug } });
    }

    if (!role) {
      throw new ApiError(404, `Role with identifier '${slug}' not found`);
    }

    await role.destroy();
    return true;
  },
};

export default roleService;
