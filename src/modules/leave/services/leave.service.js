import { leaveSchema } from "../models/leave.model.js";
import { leaveTypeSchema } from "../models/leave.type.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { RoleSchema } from "../../roles/models/role.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { buildViewPermissionCondition } from "../../../core/utils/permission.utils.js";
import { Op } from "sequelize";

const defaultIncludes = [
  {
    model: employeeSchema,
    as: "employee",
    attributes: ["id", "name", "identity", "email", "phone"],
  },
  {
    model: leaveTypeSchema,
    as: "leaveType",
    attributes: ["id", "name", "slug", "fullDay", "halfDay"],
  },
  {
    model: employeeSchema,
    as: "actionByEmployee",
    attributes: ["id", "name", "identity"],
  },
];

const calculateDuration = (fromDate, toDate, dayType) => {
  if (dayType === "half_day") {
    return 0.5;
  }
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) {
    throw new ApiError(400, "To date cannot be earlier than from date");
  }
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const leaveService = {
  applyLeave: async (data, userId) => {
    const emp_id = data.emp_id || userId;
    if (!emp_id) {
      throw new ApiError(400, "Employee ID is required to apply for leave");
    }

    const leaveType = await leaveTypeSchema.findByPk(data.leave_type_id);
    if (!leaveType) {
      throw new ApiError(404, `Leave type with ID '${data.leave_type_id}' not found`);
    }

    const dayType = data.dayType || "full_day";
    const duration = data.duration || calculateDuration(data.from_date, data.to_date, dayType);

    const leaveRecord = await leaveSchema.create({
      emp_id,
      leave_type_id: data.leave_type_id,
      dayType,
      duration,
      status: "pending",
      from_date: data.from_date,
      to_date: data.to_date,
      appliedOn: new Date(),
      reason: data.reason,
      attachment: data.attachment || null,
    });

    const createdLeave = await leaveSchema.findByPk(leaveRecord.id, {
      include: defaultIncludes,
    });

    return createdLeave;
  },

  getAllLeaves: async (queryParams = {}, userId, roleId) => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      emp_id,
      leave_type_id,
      fromDate,
      toDate,
    } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    const andConditions = [];

    if (status) {
      where.status = status;
    }

    if (emp_id) {
      where.emp_id = emp_id;
    }

    if (leave_type_id) {
      where.leave_type_id = leave_type_id;
    }

    if (fromDate && toDate) {
      andConditions.push({
        from_date: { [Op.gte]: new Date(fromDate) },
        to_date: { [Op.lte]: new Date(toDate) },
      });
    } else if (fromDate) {
      andConditions.push({
        from_date: { [Op.gte]: new Date(fromDate) },
      });
    } else if (toDate) {
      andConditions.push({
        to_date: { [Op.lte]: new Date(toDate) },
      });
    }

    if (roleId) {
      const role = await RoleSchema.findByPk(roleId);
      const viewCondition = buildViewPermissionCondition(
        role,
        "leave",
        "leave",
        userId,
        ["emp_id"]
      );
      if (viewCondition) {
        andConditions.push(viewCondition);
      }
    }

    if (search) {
      andConditions.push({
        [Op.or]: [
          { reason: { [Op.like]: `%${search}%` } },
          { "$employee.name$": { [Op.like]: `%${search}%` } },
          { "$employee.identity$": { [Op.like]: `%${search}%` } },
          { "$leaveType.name$": { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const { count, rows } = await leaveSchema.findAndCountAll({
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
      leaves: rows,
    };
  },

  getLeaveById: async (id) => {
    const leaveRecord = await leaveSchema.findByPk(id, {
      include: defaultIncludes,
    });

    if (!leaveRecord) {
      throw new ApiError(404, `Leave record with ID '${id}' not found`);
    }

    return leaveRecord;
  },

  updateLeave: async (id, updateData, userId) => {
    const leaveRecord = await leaveSchema.findByPk(id);

    if (!leaveRecord) {
      throw new ApiError(404, `Leave record with ID '${id}' not found`);
    }

    if (leaveRecord.status !== "pending") {
      throw new ApiError(400, "Only pending leave applications can be updated");
    }

    if (updateData.leave_type_id) {
      const leaveType = await leaveTypeSchema.findByPk(updateData.leave_type_id);
      if (!leaveType) {
        throw new ApiError(404, `Leave type with ID '${updateData.leave_type_id}' not found`);
      }
    }

    const dayType = updateData.dayType || leaveRecord.dayType;
    const fromDate = updateData.from_date || leaveRecord.from_date;
    const toDate = updateData.to_date || leaveRecord.to_date;

    if (updateData.from_date || updateData.to_date || updateData.dayType) {
      updateData.duration = updateData.duration || calculateDuration(fromDate, toDate, dayType);
    }

    await leaveRecord.update(updateData);

    const updatedLeave = await leaveSchema.findByPk(id, {
      include: defaultIncludes,
    });

    return updatedLeave;
  },

  actionOnLeave: async (id, actionData, actionByUserId) => {
    const leaveRecord = await leaveSchema.findByPk(id);

    if (!leaveRecord) {
      throw new ApiError(404, `Leave record with ID '${id}' not found`);
    }

    if (leaveRecord.status !== "pending") {
      throw new ApiError(400, `Leave request has already been ${leaveRecord.status}`);
    }

    await leaveRecord.update({
      status: actionData.status,
      remark: actionData.remark || leaveRecord.remark,
      actionBy: actionByUserId,
      actionOn: new Date(),
    });

    const updatedLeave = await leaveSchema.findByPk(id, {
      include: defaultIncludes,
    });

    return updatedLeave;
  },

  deleteLeave: async (id) => {
    const leaveRecord = await leaveSchema.findByPk(id);

    if (!leaveRecord) {
      throw new ApiError(404, `Leave record with ID '${id}' not found`);
    }

    await leaveRecord.destroy();
    return true;
  },
};

export default leaveService;
