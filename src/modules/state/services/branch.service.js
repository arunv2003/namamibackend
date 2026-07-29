import { branchSchema } from "../models/branch.model.js";
import { regionSchema } from "../models/region.model.js";
import { stateSchema } from "../models/state.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { Op } from "sequelize";

const defaultBranchIncludes = [
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

const formatBranchAudit = (instance) => {
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

export const branchService = {
  createBranch: async (branchData, userId) => {
    const parentState = await stateSchema.findByPk(branchData.state_id);
    if (!parentState) {
      throw new ApiError(404, `State with ID '${branchData.state_id}' not found`);
    }

    const parentRegion = await regionSchema.findByPk(branchData.region_id);
    if (!parentRegion) {
      throw new ApiError(404, `Region with ID '${branchData.region_id}' not found`);
    }

    if (parentRegion.state_id !== branchData.state_id) {
      throw new ApiError(400, `Region ID '${branchData.region_id}' does not belong to State ID '${branchData.state_id}'`);
    }

    const existingName = await branchSchema.findOne({
      where: {
        name: branchData.name,
        region_id: branchData.region_id,
      },
    });
    if (existingName) {
      throw new ApiError(400, `Branch with name '${branchData.name}' already exists in this region`);
    }

    let slug = generateSlug(branchData.name);
    let slugExists = await branchSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(branchData.name);
      slugExists = await branchSchema.findOne({ where: { slug } });
    }

    const branch = await branchSchema.create({
      ...branchData,
      slug,
      createdBy: userId || branchData.createdBy,
      updatedBy: userId || branchData.updatedBy,
    });

    const createdBranch = await branchSchema.findByPk(branch.id, {
      include: defaultBranchIncludes,
    });

    return formatBranchAudit(createdBranch);
  },

  getBranches: async (queryParams) => {
    const { page = 1, limit = 10, search, status, state_id, region_id } = queryParams;

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

    if (region_id) {
      where.region_id = region_id;
    }

    const { count, rows } = await branchSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: defaultBranchIncludes,
      distinct: true,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      branches: rows.map(formatBranchAudit),
    };
  },

  getBranchBySlug: async (slug) => {
    let branch;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      branch = await branchSchema.findByPk(slug, {
        include: defaultBranchIncludes,
      });
    } else {
      branch = await branchSchema.findOne({
        where: { slug },
        include: defaultBranchIncludes,
      });
    }

    if (!branch) {
      throw new ApiError(404, `Branch with identifier '${slug}' not found`);
    }

    return formatBranchAudit(branch);
  },

  updateBranch: async (slug, updateData, userId) => {
    let branch;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      branch = await branchSchema.findByPk(slug);
    } else {
      branch = await branchSchema.findOne({ where: { slug } });
    }

    if (!branch) {
      throw new ApiError(404, `Branch with identifier '${slug}' not found`);
    }

    delete updateData.slug;
    const id = branch.id;
    const targetStateId = updateData.state_id || branch.state_id;
    const targetRegionId = updateData.region_id || branch.region_id;

    if (updateData.state_id && updateData.state_id !== branch.state_id) {
      const parentState = await stateSchema.findByPk(updateData.state_id);
      if (!parentState) {
        throw new ApiError(404, `State with ID '${updateData.state_id}' not found`);
      }
    }

    if (updateData.region_id && updateData.region_id !== branch.region_id) {
      const parentRegion = await regionSchema.findByPk(updateData.region_id);
      if (!parentRegion) {
        throw new ApiError(404, `Region with ID '${updateData.region_id}' not found`);
      }
      if (parentRegion.state_id !== targetStateId) {
        throw new ApiError(400, `Region ID '${updateData.region_id}' does not belong to State ID '${targetStateId}'`);
      }
    }

    if (updateData.name && (updateData.name !== branch.name || updateData.region_id)) {
      const nameExists = await branchSchema.findOne({
        where: {
          name: updateData.name || branch.name,
          region_id: targetRegionId,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(400, `Branch with name '${updateData.name || branch.name}' already exists in this region`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await branch.update(updateData);

    const updatedBranch = await branchSchema.findByPk(id, {
      include: defaultBranchIncludes,
    });
    return formatBranchAudit(updatedBranch);
  },

  deleteBranch: async (slug) => {
    let branch;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      branch = await branchSchema.findByPk(slug);
    } else {
      branch = await branchSchema.findOne({ where: { slug } });
    }

    if (!branch) {
      throw new ApiError(404, `Branch with identifier '${slug}' not found`);
    }

    await branch.destroy();
    return true;
  },
};

export default branchService;
