import { fieldSchema } from "../models/fieldvisit.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { customerSchema } from "../../customer/models/customer.model.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { Op } from "sequelize";
import { attendanceSchema } from "../../attendance/models/attendance.model.js";
import { officeSchema } from "../../office/models/office.models.js";

const defaultIncludes = [
  {
    model: employeeSchema,
    as: "employee",
    attributes: ["id", "emp_id", "name", "identity"],
  },
  {
    model: customerSchema,
    as: "customer",
    attributes: ["id", "customer_id", "name", "phone", "location"],
    required: false,
  },
];

export const fieldVisitService = {
  createFieldVisit: async (data, currentUserId) => {
    const empId = currentUserId || data.emp_id;
    if (!empId) {
      throw new ApiError(401, "Unauthorized: User ID not found in request");
    }

    const employeeExists = await employeeSchema.findByPk(empId);
    if (!employeeExists) {
      throw new ApiError(404, `Employee with ID ${empId} not found`);
    }

    const targetDate = data.date ? new Date(data.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingVisit = await fieldSchema.findOne({
      where: {
        emp_id: empId,
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const rawLocations = data.locations
      ? Array.isArray(data.locations)
        ? data.locations
        : [data.locations]
      : [];

    const incomingLocations = rawLocations.map((loc) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      ...(loc.time !== undefined && { time: loc.time }),
      addedAt: loc.addedAt || new Date().toISOString(),
    }));

    if (existingVisit) {
      const currentLocations = Array.isArray(existingVisit.locations)
        ? existingVisit.locations
        : [];
      const updatedLocations = [...currentLocations, ...incomingLocations];

      const updatePayload = {
        locations: updatedLocations,
      };
      if (data.purpose) updatePayload.purpose = data.purpose;
      if (data.remark !== undefined) updatePayload.remark = data.remark;
      if (data.status) updatePayload.status = data.status;

      await existingVisit.update(updatePayload);

      const updatedVisit = await fieldSchema.findByPk(existingVisit.id, {
        include: defaultIncludes,
      });
      return updatedVisit;
    }

    const newVisit = await fieldSchema.create({
      ...data,
      emp_id: empId,
      purpose: data.purpose || "Field Visit",
      date: targetDate,
      locations: incomingLocations,
    });

    const visit = await fieldSchema.findByPk(newVisit.id, {
      include: defaultIncludes,
    });

    return visit;
  },

  getFieldVisits: async (queryParams) => {
    const {
      page = 1,
      limit = 10,
      search,
      emp_id,
      status,
      startDate,
      endDate,
    } = queryParams;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};

    if (emp_id) {
      where.emp_id = emp_id;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.date = { [Op.lte]: new Date(endDate) };
    }

    if (search) {
      where[Op.or] = [
        { purpose: { [Op.like]: `%${search}%` } },
        { remark: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await fieldSchema.findAndCountAll({
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
      fieldVisits: rows,
    };
  },

  getFieldVisitById: async (id) => {
    const visit = await fieldSchema.findByPk(id, {
      include: defaultIncludes,
    });

    if (!visit) {
      throw new ApiError(404, `Field visit with ID '${id}' not found`);
    }

    return visit;
  },

  getfieldVisitByDate: async (date, emp_id) => {
    const d = new Date(date);
    const dateStr =
      typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const todayAttendance = await attendanceSchema.findOne({
      where: {
        employee_id: emp_id,
        date: dateStr,
      },
      include: [
        {
          model: employeeSchema,
          foreignKey: "employee_id",
          attributes: ["id", "emp_id", "name", "identity", "mobile", "email", "designations", "department"],
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
      ],
    });

    if (!todayAttendance) {
      throw new ApiError(404, `Attendance for employee with ID '${emp_id}' on ${date} not found`);
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);


    const visits = await fieldSchema.findAll({
      include: defaultIncludes,
      where: {
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
        emp_id: emp_id,
      },
    });

    // Collect all unique customerIds from all location entries across all visits
    const customerIdSet = new Set();
    for (const visit of visits) {
      if (Array.isArray(visit.locations)) {
        for (const loc of visit.locations) {
          if (loc.customerId != null) customerIdSet.add(loc.customerId);
        }
      }
    }

    // Fetch customer data in one query
    let customerMap = {};
    if (customerIdSet.size > 0) {
      const customers = await customerSchema.findAll({
        where: { id: [...customerIdSet] },
        attributes: ["id", "customer_id", "name", "phone", "location"],
      });
      customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));
    }

    // Enrich each location entry with customer data
    const enrichedVisits = visits.map((visit) => {
      const plain = visit.toJSON();
      if (Array.isArray(plain.locations)) {
        plain.locations = plain.locations.map((loc) => ({
          ...loc,
          customer: loc.customerId != null ? (customerMap[loc.customerId] || null) : null,
        }));
      }
      return plain;
    });

    return {
      attendance: todayAttendance,
      visits: enrichedVisits,
    };
  },

  updateFieldVisit: async (id, updateData) => {
    const visit = await fieldSchema.findByPk(id);

    if (!visit) {
      throw new ApiError(404, `Field visit with ID '${id}' not found`);
    }

    if (updateData.emp_id && updateData.emp_id !== visit.emp_id) {
      const empExists = await employeeSchema.findByPk(updateData.emp_id);
      if (!empExists) {
        throw new ApiError(404, `Employee with ID ${updateData.emp_id} not found`);
      }
    }

    await visit.update(updateData);

    const updatedVisit = await fieldSchema.findByPk(id, {
      include: defaultIncludes,
    });

    return updatedVisit;
  },

  addLocation: async (id, locationData) => {
    const visit = await fieldSchema.findByPk(id);

    if (!visit) {
      throw new ApiError(404, `Field visit with ID '${id}' not found`);
    }

    const currentLocations = Array.isArray(visit.locations) ? visit.locations : [];

    const newLocation = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      ...(locationData.time !== undefined && { time: locationData.time }),
      addedAt: new Date().toISOString(),
    };

    const updatedLocations = [...currentLocations, newLocation];

    await visit.update({ locations: updatedLocations });

    const updatedVisit = await fieldSchema.findByPk(id, {
      include: defaultIncludes,
    });

    return updatedVisit;
  },

  deleteFieldVisit: async (id) => {
    const visit = await fieldSchema.findByPk(id);

    if (!visit) {
      throw new ApiError(404, `Field visit with ID '${id}' not found`);
    }

    await visit.destroy();
    return true;
  },
};

export default fieldVisitService;
