import { regionSchema } from "../models/region.model.js";
import { stateSchema } from "../models/state.model.js";
import { branchSchema } from "../models/branch.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { Op } from "sequelize";

const defaultRegionIncludes = [
  {
    model: stateSchema,
    as: "state",
    attributes: ["id", "name", "slug"],
  },
  {
    model: branchSchema,
    as: "branches",
    attributes: ["id", "name", "slug", "status"],
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

const formatRegionAudit = (instance) => {
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

export const regionService = {
  createRegion: async (regionData, userId) => {
    const parentState = await stateSchema.findByPk(regionData.state_id);
    if (!parentState) {
      throw new ApiError(404, `State with ID '${regionData.state_id}' not found`);
    }

    const existingName = await regionSchema.findOne({
      where: {
        name: regionData.name,
        state_id: regionData.state_id,
      },
    });
    if (existingName) {
      throw new ApiError(400, `Region with name '${regionData.name}' already exists in this state`);
    }

    let slug = generateSlug(regionData.name);
    let slugExists = await regionSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(regionData.name);
      slugExists = await regionSchema.findOne({ where: { slug } });
    }

    const region = await regionSchema.create({
      ...regionData,
      slug,
      createdBy: userId || regionData.createdBy,
      updatedBy: userId || regionData.updatedBy,
    });

    const createdRegion = await regionSchema.findByPk(region.id, {
      include: defaultRegionIncludes,
    });

    return formatRegionAudit(createdRegion);
  },

  getRegions: async (queryParams) => {
    const { page = 1, limit = 10, search, status, state_id } = queryParams;

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

    if (status) {
      where.status = status;
    }

    if (state_id) {
      where.state_id = state_id;
    }

    const { count, rows } = await regionSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: defaultRegionIncludes,
      distinct: true,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      regions: rows.map(formatRegionAudit),
    };
  },

  getRegionBySlug: async (slug) => {
    let region;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      region = await regionSchema.findByPk(slug, {
        include: defaultRegionIncludes,
      });
    } else {
      region = await regionSchema.findOne({
        where: { slug },
        include: defaultRegionIncludes,
      });
    }

    if (!region) {
      throw new ApiError(404, `Region with identifier '${slug}' not found`);
    }

    return formatRegionAudit(region);
  },

  updateRegion: async (slug, updateData, userId) => {
    let region;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      region = await regionSchema.findByPk(slug);
    } else {
      region = await regionSchema.findOne({ where: { slug } });
    }

    if (!region) {
      throw new ApiError(404, `Region with identifier '${slug}' not found`);
    }

    delete updateData.slug;
    const id = region.id;
    const targetStateId = updateData.state_id || region.state_id;

    if (updateData.state_id && updateData.state_id !== region.state_id) {
      const parentState = await stateSchema.findByPk(updateData.state_id);
      if (!parentState) {
        throw new ApiError(404, `State with ID '${updateData.state_id}' not found`);
      }
    }

    if (updateData.name && (updateData.name !== region.name || updateData.state_id)) {
      const nameExists = await regionSchema.findOne({
        where: {
          name: updateData.name || region.name,
          state_id: targetStateId,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(400, `Region with name '${updateData.name || region.name}' already exists in this state`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await region.update(updateData);

    const updatedRegion = await regionSchema.findByPk(id, {
      include: defaultRegionIncludes,
    });
    return formatRegionAudit(updatedRegion);
  },

  deleteRegion: async (slug) => {
    let region;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      region = await regionSchema.findByPk(slug);
    } else {
      region = await regionSchema.findOne({ where: { slug } });
    }

    if (!region) {
      throw new ApiError(404, `Region with identifier '${slug}' not found`);
    }

    await region.destroy();
    return true;
  },
};

export default regionService;
