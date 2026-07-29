import { stateSchema } from "../models/state.model.js";
import { regionSchema } from "../models/region.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { Op } from "sequelize";

const defaultStateIncludes = [
  {
    model: regionSchema,
    as: "regionsList",
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

const formatStateAudit = (instance) => {
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

export const stateService = {
  createState: async (stateData, userId) => {
    const existingName = await stateSchema.findOne({
      where: { name: stateData.name },
    });
    if (existingName) {
      throw new ApiError(400, `State with name '${stateData.name}' already exists`);
    }

    let slug = generateSlug(stateData.name);
    let slugExists = await stateSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(stateData.name);
      slugExists = await stateSchema.findOne({ where: { slug } });
    }

    const state = await stateSchema.create({
      ...stateData,
      slug,
      createdBy: userId || stateData.createdBy,
      updatedBy: userId || stateData.updatedBy,
    });

    const createdState = await stateSchema.findByPk(state.id, {
      include: defaultStateIncludes,
    });

    return formatStateAudit(createdState);
  },

  getStates: async (queryParams) => {
    const { page = 1, limit = 10, search, status } = queryParams;

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

    const { count, rows } = await stateSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: defaultStateIncludes,
      distinct: true,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      states: rows.map(formatStateAudit),
    };
  },

  getStateBySlug: async (slug) => {
    let state;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      state = await stateSchema.findByPk(slug, {
        include: defaultStateIncludes,
      });
    } else {
      state = await stateSchema.findOne({
        where: { slug },
        include: defaultStateIncludes,
      });
    }

    if (!state) {
      throw new ApiError(404, `State with identifier '${slug}' not found`);
    }

    return formatStateAudit(state);
  },

  updateState: async (slug, updateData, userId) => {
    let state;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      state = await stateSchema.findByPk(slug);
    } else {
      state = await stateSchema.findOne({ where: { slug } });
    }

    if (!state) {
      throw new ApiError(404, `State with identifier '${slug}' not found`);
    }

    delete updateData.slug;
    const id = state.id;

    if (updateData.name && updateData.name !== state.name) {
      const nameExists = await stateSchema.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });
      if (nameExists) {
        throw new ApiError(400, `State with name '${updateData.name}' already exists`);
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await state.update(updateData);

    const updatedState = await stateSchema.findByPk(id, {
      include: defaultStateIncludes,
    });
    return formatStateAudit(updatedState);
  },

  deleteState: async (slug) => {
    let state;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      state = await stateSchema.findByPk(slug);
    } else {
      state = await stateSchema.findOne({ where: { slug } });
    }

    if (!state) {
      throw new ApiError(404, `State with identifier '${slug}' not found`);
    }

    await state.destroy();
    return true;
  },
};

export default stateService;
