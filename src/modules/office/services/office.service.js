import { officeSchema } from "../models/office.models.js";
import { stateSchema } from "../../state/models/state.model.js";
import { regionSchema } from "../../state/models/region.model.js";
import { branchSchema } from "../../state/models/branch.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { RoleSchema } from "../../roles/models/role.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { buildViewPermissionCondition } from "../../../core/utils/permission.utils.js";
import { Op } from "sequelize";

const defaultOfficeIncludes = [
  {
    model: stateSchema,
    as: "state",
    attributes: ["id", "name", "slug"],
  },
  {
    model: regionSchema,
    as: "region",
    attributes: ["id", "name", "slug"],
  },
  {
    model: branchSchema,
    as: "branch",
    attributes: ["id", "name", "slug"],
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

const formatOfficeAudit = (officeInstance) => {
  if (!officeInstance) return officeInstance;
  const item = typeof officeInstance.toJSON === "function" ? officeInstance.toJSON() : { ...officeInstance };

  if (item.state && typeof item.state === "object") {
    item.state_name = item.state.name;
    if (typeof item.state_id === "object") {
      item.state_id = item.state.id;
    }
  }
  if (item.region && typeof item.region === "object") {
    item.region_name = item.region.name;
    if (typeof item.region_id === "object") {
      item.region_id = item.region.id;
    }
  }
  if (item.branch && typeof item.branch === "object") {
    item.branch_name = item.branch.name;
    if (typeof item.branch_id === "object") {
      item.branch_id = item.branch.id;
    }
  }
  if (item.creator !== undefined) {
    item.createdBy = item.creator;
  }
  if (item.updater !== undefined) {
    item.updatedBy = item.updater;
  }
  return item;
};

export const officeService = {
  createOffice: async (officeData, userId) => {
    // 1. Check if office with same name already exists
    const existingName = await officeSchema.findOne({
      where: { name: officeData.name }
    });
    if (existingName) {
      throw new ApiError(400, `Office with name '${officeData.name}' already exists`);
    }

    // Generate unique slug
    let slug = generateSlug(officeData.name);
    let slugExists = await officeSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(officeData.name);
      slugExists = await officeSchema.findOne({ where: { slug } });
    }

    // Save to database
    const office = await officeSchema.create({
      ...officeData,
      slug,
      createdBy: userId || officeData.createdBy,
      updatedBy: userId || officeData.updatedBy
    });

    const createdOffice = await officeSchema.findByPk(office.id, {
      include: defaultOfficeIncludes
    });

    return formatOfficeAudit(createdOffice);
  },

  getOffices: async (queryParams, userId, roleId) => {
    const { 
      page = 1, 
      limit = 10, 
      search 
    } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    const andConditions = [];

    if (roleId) {
      const role = await RoleSchema.findByPk(roleId);
      const viewCondition = buildViewPermissionCondition(
        role,
        "location",
        "branch",
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
          { slug: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const { count, rows } = await officeSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']],
      include: defaultOfficeIncludes
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      offices: rows.map(formatOfficeAudit)
    };
  },

  getOfficeBySlug: async (slug) => {
    let office;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      office = await officeSchema.findByPk(slug, {
        include: defaultOfficeIncludes
      });
    } else {
      office = await officeSchema.findOne({
        where: { slug },
        include: defaultOfficeIncludes
      });
    }

    if (!office) {
      throw new ApiError(404, `Office with identifier '${slug}' not found`);
    }

    return formatOfficeAudit(office);
  },

  updateOffice: async (slug, updateData, userId) => {
    let office;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      office = await officeSchema.findByPk(slug);
    } else {
      office = await officeSchema.findOne({ where: { slug } });
    }

    if (!office) {
      throw new ApiError(404, `Office with identifier '${slug}' not found`);
    }

    delete updateData.slug;
    const id = office.id;

    // If name is updating, check for name conflict
    if (updateData.name && updateData.name !== office.name) {
      const nameExists = await officeSchema.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id }
        }
      });
      if (nameExists) {
        throw new ApiError(400, `Office with name '${updateData.name}' already exists`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await office.update(updateData);

    const updatedOffice = await officeSchema.findByPk(id, {
      include: defaultOfficeIncludes
    });
    return formatOfficeAudit(updatedOffice);
  },

  deleteOffice: async (slug) => {
    let office;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      office = await officeSchema.findByPk(slug);
    } else {
      office = await officeSchema.findOne({ where: { slug } });
    }

    if (!office) {
      throw new ApiError(404, `Office with identifier '${slug}' not found`);
    }

    await office.destroy();
    return true;
  }
};

export default officeService;
