import { fieldSchema } from "../models/fieldvisit.model.js";
import { employeeSchema } from "../../employees/models/employee.model.js";
import { Op } from "sequelize";

const defaultIncludes = [
  {
    model: employeeSchema,
    as: "employee",
    attributes: ["id", "emp_id", "name", "identity"],
  },
];

export const processSocketLocationUpdate = async (payload) => {
  const { emp_id, latitude, longitude, time, date, purpose, remark, customerId } = payload || {};

  if (!emp_id) {
    throw new Error("emp_id is required for socket location update");
  }

  const numericEmpId = Number(emp_id);
  const employeeExists = await employeeSchema.findByPk(numericEmpId);
  if (!employeeExists) {
    throw new Error(`Employee with ID ${numericEmpId} not found`);
  }

  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingVisit = await fieldSchema.findOne({
    where: {
      emp_id: numericEmpId,
      date: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  const addedLocation = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    ...(time !== undefined && { time }),
    ...(customerId !== undefined && { customerId }),
    addedAt: new Date().toISOString(),
  };

  if (existingVisit) {
    const currentLocations = Array.isArray(existingVisit.locations)
      ? existingVisit.locations
      : [];
    const updatedLocations = [...currentLocations, addedLocation];

    const updatePayload = {
      locations: updatedLocations,
    };
    if (purpose) updatePayload.purpose = purpose;
    if (remark !== undefined) updatePayload.remark = remark;

    await existingVisit.update(updatePayload);

    const updatedVisit = await fieldSchema.findByPk(existingVisit.id, {
      include: defaultIncludes,
    });

    return {
      visit: updatedVisit,
      isNew: false,
      addedLocation,
    };
  }

  const newVisit = await fieldSchema.create({
    emp_id: numericEmpId,
    purpose: purpose || "Field Visit",
    remark: remark || null,
    date: targetDate,
    locations: [addedLocation],
  });

  const visit = await fieldSchema.findByPk(newVisit.id, {
    include: defaultIncludes,
  });

  return {
    visit,
    isNew: true,
    addedLocation,
  };
};

export default {
  processSocketLocationUpdate,
};
