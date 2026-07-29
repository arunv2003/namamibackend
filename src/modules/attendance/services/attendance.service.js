import { attendanceSchema, employeeSchema, officeSchema, RoleSchema } from "../../../core/models/index.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { Op } from "sequelize";

const defaultIncludes = [
  {
    model: employeeSchema,
    as: "employee",
    attributes: ["id", "emp_id", "name", "email", "department"],
  },
  {
    model: officeSchema,
    as: "punchInOffice",
    attributes: ["id", "name", "address", "latitude", "longitude", "radius"],
  },
  {
    model: officeSchema,
    as: "punchOutOffice",
    attributes: ["id", "name", "address", "latitude", "longitude", "radius"],
  },
];

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const calculateAttendanceStatus = (totalHours) => {
  if (totalHours === null || totalHours === undefined || isNaN(totalHours)) {
    return "CLOCKED_IN";
  }
  if (totalHours < 2.0) {
    return "ABSENT";
  }
  if (totalHours < 4.5) {
    return "HALF_DAY";
  }
  return "PRESENT";
};

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const verifyEmployeeOfficeGeofence = async (employee, location, type = "punchIn") => {
  if (
    !location ||
    location.latitude === undefined ||
    location.latitude === null ||
    location.longitude === undefined ||
    location.longitude === null
  ) {
    throw new ApiError(400, "Location coordinates (latitude and longitude) are required");
  }

  const empLat = parseFloat(location.latitude);
  const empLon = parseFloat(location.longitude);

  if (isNaN(empLat) || isNaN(empLon)) {
    throw new ApiError(400, "Invalid location coordinates provided");
  }

  const rawOfficeIds = type === "punchIn" ? employee?.punchIn : employee?.punchOut;

  let officeIds = [];
  if (Array.isArray(rawOfficeIds)) {
    officeIds = rawOfficeIds;
  } else if (rawOfficeIds !== null && rawOfficeIds !== undefined && rawOfficeIds !== "") {
    officeIds = [rawOfficeIds];
  }

  const validOfficeIds = officeIds
    .map((id) => (typeof id === "object" && id !== null ? id.id : id))
    .filter((id) => id !== null && id !== undefined && id !== "");

  let assignedOffices = [];

  if (validOfficeIds.length > 0) {
    const numericIds = validOfficeIds
      .filter((x) => typeof x === "number" || (!isNaN(Number(x)) && String(x).trim() !== ""))
      .map(Number);
    const stringNames = validOfficeIds.map(String);

    const whereConditions = [];
    if (numericIds.length > 0) whereConditions.push({ id: numericIds });
    if (stringNames.length > 0) whereConditions.push({ name: stringNames });

    assignedOffices = await officeSchema.findAll({
      where: whereConditions.length > 1 ? { [Op.or]: whereConditions } : (whereConditions[0] || {}),
    });
  }

  // Fallback: If no specific office assigned (or corrupted data), search across all registered offices
  if (!assignedOffices || assignedOffices.length === 0) {
    assignedOffices = await officeSchema.findAll();
  }

  if (!assignedOffices || assignedOffices.length === 0) {
    throw new ApiError(400, "No office details found in system");
  }

  let matchedOffice = null;

  for (const office of assignedOffices) {
    const offLat = parseFloat(office.latitude);
    const offLon = parseFloat(office.longitude);
    const rad = parseFloat(office.radius);

    if (isNaN(offLat) || isNaN(offLon) || isNaN(rad)) continue;

    const distanceMeters = getDistanceInMeters(empLat, empLon, offLat, offLon);
    const allowedRadiusMeters = rad < 50 ? rad * 1000 : rad;

    if (distanceMeters <= allowedRadiusMeters) {
      matchedOffice = office;
      break;
    }
  }

  if (!matchedOffice) {
    throw new ApiError(
      400,
      `You are not within the allowed office radius to ${type === "punchIn" ? "punch in" : "punch out"}`
    );
  }

  return matchedOffice.id;
};

export const attendanceService = {
  clockIn: async (data, currentUserId) => {
    const empId = currentUserId || data.employee_id;
    if (!empId) {
      throw new ApiError(400, "Employee ID is required");
    }

    const employeeExists = await employeeSchema.findByPk(empId);
    if (!employeeExists) {
      throw new ApiError(404, `Employee with ID ${empId} not found`);
    }

    const matchedOfficeId = await verifyEmployeeOfficeGeofence(employeeExists, data.location, "punchIn");

    const todayStr = getTodayDateString();
    let record = await attendanceSchema.findOne({
      where: {
        employee_id: empId,
        date: todayStr,
      },
    });

    const now = new Date();

    if (record) {
      if (record.clock_in) {
        throw new ApiError(400, "Employee is already clocked in today");
      }
      await record.update({
        clock_in: now,
        status: "CLOCKED_IN",
        clock_in_location: data.location || null,
        clock_in_ip: data.ip_address || null,
        clock_in_device: data.device_info || null,
        punchinOffice: matchedOfficeId,
        remarks: data.remarks || record.remarks,
      });
    } else {
      record = await attendanceSchema.create({
        employee_id: empId,
        date: todayStr,
        clock_in: now,
        status: "CLOCKED_IN",
        clock_in_location: data.location || null,
        clock_in_ip: data.ip_address || null,
        clock_in_device: data.device_info || null,
        punchinOffice: matchedOfficeId,
        remarks: data.remarks || null,
      });
    }

    // Optionally update employee last location timestamp
    if (data.location) {
      const locStr = typeof data.location === "object" ? JSON.stringify(data.location) : String(data.location);
      await employeeExists.update({
        last_location: locStr.slice(0, 200),
        last_Sync_mobile: now,
      });
    }

    return attendanceSchema.findByPk(record.id, {
      include: defaultIncludes,
    });
  },

  clockOut: async (data, currentUserId) => {
    const empId = currentUserId || data.employee_id;
    if (!empId) {
      throw new ApiError(400, "Employee ID is required");
    }

    const employeeExists = await employeeSchema.findByPk(empId);
    if (!employeeExists) {
      throw new ApiError(404, `Employee with ID ${empId} not found`);
    }

    const matchedOfficeId = await verifyEmployeeOfficeGeofence(employeeExists, data.location, "punchOut");

    const todayStr = getTodayDateString();
    const record = await attendanceSchema.findOne({
      where: {
        employee_id: empId,
        date: todayStr,
      },
    });

    if (!record || !record.clock_in) {
      throw new ApiError(400, "Cannot clock out: No clock in record found for today");
    }

    if (record.clock_out) {
      throw new ApiError(400, "Employee has already clocked out today");
    }

    const now = new Date();
    const clockInTime = new Date(record.clock_in);
    const diffMs = now - clockInTime;
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    const calculatedStatus = calculateAttendanceStatus(totalHours);

    await record.update({
      clock_out: now,
      status: calculatedStatus,
      clock_out_location: data.location || null,
      clock_out_ip: data.ip_address || null,
      clock_out_device: data.device_info || null,
      punchoutOffice: matchedOfficeId,
      total_hours: totalHours,
      remarks: data.remarks
        ? record.remarks
          ? `${record.remarks} | ${data.remarks}`
          : data.remarks
        : record.remarks,
    });

    // Optionally update employee last location timestamp
    if (data.location) {
      const locStr = typeof data.location === "object" ? JSON.stringify(data.location) : String(data.location);
      await employeeExists.update({
        last_location: locStr.slice(0, 200),
        last_Sync_mobile: now,
      });
    }

    return attendanceSchema.findByPk(record.id, {
      include: defaultIncludes,
    });
  },

  createAttendance: async (data, currentUserId) => {
    // Convenience wrapper around clockIn
    return attendanceService.clockIn(data, currentUserId);
  },

  getAllEmployeeAttendance: async (id, page = 1, limit = 10, search = "", status = "") => {
    const employee = await employeeSchema.findByPk(id);
    if (!employee) {
      throw new ApiError(404, `Employee with ID ${id} not found`);
    }
    const role = await RoleSchema.findByPk(employee.type);
    if (!role) {
      throw new ApiError(404, `Role with ID ${employee.type} not found`);
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const roleName = (role.name || "").toLowerCase();
    const where = {};

    if (roleName !== "admin") {
      const subordinates = await employeeSchema.findAll({
        where: { manager_id: id },
        attributes: ["id"],
      });
      const teamEmployeeIds = [Number(id), ...subordinates.map((emp) => emp.id)];
      where.employee_id = { [Op.in]: teamEmployeeIds };
    }

    if (status && status !== "All") {
      where.status = status;
    }

    const { count, rows } = await attendanceSchema.findAndCountAll({
      where,
      include: defaultIncludes,
      limit: parsedLimit,
      offset,
      order: [["date", "DESC"]],
      distinct: true,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      attendances: rows,
    };
  },

  getTodayAttendance: async (employeeId) => {
    if (!employeeId) {
      throw new ApiError(400, "Employee ID is required");
    }

    const todayStr = getTodayDateString();
    const record = await attendanceSchema.findOne({
      where: {
        employee_id: employeeId,
        date: todayStr,
      },
      include: defaultIncludes,
    });

    return {
      employee_id: employeeId,
      date: todayStr,
      isClockedIn: Boolean(record && record.clock_in && !record.clock_out),
      isClockedOut: Boolean(record && record.clock_out),
      attendance: record || null,
    };
  },

  getAttendanceSummary: async (queryParams = {}) => {
    const { startDate, endDate, employee_id } = queryParams;
    const where = {};

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    const totalDaysRecorded = await attendanceSchema.count({ where });
    const clockedIns = await attendanceSchema.count({
      where: { ...where, status: "CLOCKED_IN" },
    });
    const clockedOuts = await attendanceSchema.count({
      where: { ...where, status: "CLOCKED_OUT" },
    });

    return {
      totalDaysRecorded,
      currentlyClockedIn: clockedIns,
      completedClockedOut: clockedOuts,
    };
  },

  getAttendances: async (queryParams = {}) => {
    const {
      page = 1,
      limit = 10,
      employee_id,
      status,
      startDate,
      endDate,
    } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    const { count, rows } = await attendanceSchema.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [["date", "DESC"]],
      include: defaultIncludes,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      attendances: rows,
    };
  },

  getAttendanceById: async (id) => {
    const record = await attendanceSchema.findByPk(id, {
      include: defaultIncludes,
    });

    if (!record) {
      throw new ApiError(404, `Attendance record with ID '${id}' not found`);
    }

    return record;
  },

  updateAttendance: async (id, updateData) => {
    const record = await attendanceSchema.findByPk(id);

    if (!record) {
      throw new ApiError(404, `Attendance record with ID '${id}' not found`);
    }

    if (updateData.employee_id && updateData.employee_id !== record.employee_id) {
      const empExists = await employeeSchema.findByPk(updateData.employee_id);
      if (!empExists) {
        throw new ApiError(404, `Employee with ID ${updateData.employee_id} not found`);
      }
    }

    await record.update(updateData);

    // Recalculate total_hours and status if both clock_in and clock_out are present
    if (record.clock_in && record.clock_out) {
      const clockInTime = new Date(record.clock_in);
      const clockOutTime = new Date(record.clock_out);
      const diffMs = clockOutTime - clockInTime;
      const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      const newStatus = updateData.status || calculateAttendanceStatus(totalHours);
      await record.update({ total_hours: totalHours, status: newStatus });
    }

    return attendanceSchema.findByPk(id, {
      include: defaultIncludes,
    });
  },

  markDailyAbsentees: async (targetDate) => {
    const dateStr = targetDate || getTodayDateString();

    const allEmployees = await employeeSchema.findAll({
      attributes: ["id", "emp_id", "name"],
    });

    if (!allEmployees || allEmployees.length === 0) {
      return { date: dateStr, markedCount: 0, message: "No active employees found" };
    }

    const existingRecords = await attendanceSchema.findAll({
      where: { date: dateStr },
      attributes: ["employee_id"],
    });

    const attendedEmpIds = new Set(existingRecords.map((r) => r.employee_id));
    const missingEmployees = allEmployees.filter((emp) => !attendedEmpIds.has(emp.id));

    if (missingEmployees.length === 0) {
      return {
        date: dateStr,
        markedCount: 0,
        message: "All employees have attendance records for this date",
      };
    }

    const absentRecords = missingEmployees.map((emp) => ({
      employee_id: emp.id,
      date: dateStr,
      clock_in: null,
      clock_out: null,
      status: "ABSENT",
      total_hours: 0,
      remarks: "Auto-marked ABSENT (No clock-in recorded)",
    }));

    await attendanceSchema.bulkCreate(absentRecords);

    return {
      date: dateStr,
      markedCount: absentRecords.length,
      absentEmployeeIds: missingEmployees.map((e) => e.id),
      message: `Successfully marked ${absentRecords.length} employees as ABSENT for ${dateStr}`,
    };
  },

  deleteAttendance: async (id) => {
    const record = await attendanceSchema.findByPk(id);

    if (!record) {
      throw new ApiError(404, `Attendance record with ID '${id}' not found`);
    }

    await record.destroy();
    return true;
  },
};

export default attendanceService;
