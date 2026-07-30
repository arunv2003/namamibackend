import { z } from "zod";

const processGeofenceArray = (val) => {
  if (val === undefined || val === null || val === "") return [];
  const rawArray = Array.isArray(val) ? val : [val];
  return rawArray
    .map((v) => {
      if (v === null || v === undefined) return null;
      if (typeof v === "number") return isNaN(v) ? null : v;
      const str = String(v).trim();
      if (!str || str.toLowerCase() === "nan" || str.toLowerCase() === "null" || str.toLowerCase() === "undefined") {
        return null;
      }
      const num = Number(str);
      return !isNaN(num) ? num : str;
    })
    .filter((v) => v !== null);
};

export const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  manager_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().nonnegative("Manager ID must be a non-negative integer").optional().nullable()
  ),
  identity: z.string().min(1, "Identity is required"),
  image: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  department: z.string().min(1, "Department is required"),
  email: z.string().email("Invalid email address"),
  designations: z.string().min(1, "Designations is required"),
  country_code: z.string().optional().nullable(),
  mobileCountryCode: z.string().optional().nullable(),
  mobile: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return "9999999999";
    const str = String(val).replace(/[^\d+]/g, "").slice(0, 15);
    return str.length >= 10 ? str : "9999999999";
  }, z.string().min(10, "Mobile must be at least 10 digits").max(15, "Mobile must not exceed 15 characters")),
  work_shift: z.string().min(1, "Work shift is required"),
  status: z.string().min(1, "Status is required"),
  work_location: z.string().min(1, "Work location is required"),

  emp_type: z.string().min(1, "Employee type is required"),
  business_unit: z.string().min(1, "Business unit is required"),
  license: z.string().min(1, "License is required"),
  cost_center: z.string().min(1, "Cost center is required"),
  type: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().nonnegative("Type (Role ID) must be a non-negative integer").optional().nullable()
  ),
  punchIn: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),
  punchOut: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),
  entryAlerts: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),
  exitAlerts: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),

  app_version: z.string().min(1, "App version is required"),
  desktop_version: z.string().min(1, "Desktop version is required"),
  last_desktop_started_at: z.coerce.date(),
  last_Sync_desktop_at: z.coerce.date(),
  last_Sync_mobile: z.coerce.date(),
  last_location: z.string().min(1, "Last location is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  date_of_birth: z.coerce.date(),
  date_of_joining: z.coerce.date(),
  state_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 1 : Number(val)),
    z.number().int().nonnegative("State ID must be a non-negative integer")
  ),
  region_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 1 : Number(val)),
    z.number().int().nonnegative("Region ID must be a non-negative integer")
  ),
  branch_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 1 : Number(val)),
    z.number().int().nonnegative("Branch ID must be a non-negative integer")
  ),
  gender: z.string().optional().nullable(),
  blood_group: z.string().optional().nullable(),
  label_color: z.string().optional().nullable(),
  team: z.string().optional().nullable(),
  password: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? "123456" : String(val)),
    z.string().min(6, "Password must be at least 6 characters").optional().nullable()
  ),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  gender: z.string().optional().nullable(),
  blood_group: z.string().optional().nullable(),
  label_color: z.string().optional().nullable(),
  team: z.string().optional().nullable(),
  manager_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().nonnegative("Manager ID must be a non-negative integer").optional().nullable()
  ),
  identity: z.string().min(1, "Identity is required").optional(),
  image: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  department: z.string().min(1, "Department is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  designations: z.string().min(1, "Designations is required").optional(),
  country_code: z.string().optional().nullable(),
  mobileCountryCode: z.string().optional().nullable(),
  mobile: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const str = String(val).replace(/[^\d+]/g, "").slice(0, 15);
    return str.length >= 10 ? str : undefined;
  }, z.string().min(10, "Mobile must be at least 10 digits").max(15, "Mobile must not exceed 15 characters").optional()),
  work_shift: z.string().min(1, "Work shift is required").optional(),
  status: z.string().min(1, "Status is required").optional(),
  work_location: z.string().min(1, "Work location is required").optional(),

  emp_type: z.string().min(1, "Employee type is required").optional(),
  business_unit: z.string().min(1, "Business unit is required").optional(),
  license: z.string().min(1, "License is required").optional(),
  cost_center: z.string().min(1, "Cost center is required").optional(),
  type: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().nonnegative("Type (Role ID) must be a non-negative integer").optional().nullable()
  ),
  punchIn: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),
  punchOut: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),
  entryAlerts: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),
  exitAlerts: z.preprocess(processGeofenceArray, z.array(z.union([z.number(), z.string()])).optional().nullable()),

  app_version: z.string().min(1, "App version is required").optional(),
  desktop_version: z.string().min(1, "Desktop version is required").optional(),
  last_desktop_started_at: z.coerce.date().optional(),
  last_Sync_desktop_at: z.coerce.date().optional(),
  last_Sync_mobile: z.coerce.date().optional(),
  last_location: z.string().min(1, "Last location is required").optional(),
  location: z.string().min(1, "Location is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  date_of_birth: z.coerce.date().optional(),
  date_of_joining: z.coerce.date().optional(),
  state_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().nonnegative("State ID must be a non-negative integer").optional()
  ),
  region_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().nonnegative("Region ID must be a non-negative integer").optional()
  ),
  branch_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().nonnegative("Branch ID must be a non-negative integer").optional()
  ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export const loginEmployeeSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    mobile: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.mobile, {
    message: "Either email or mobile is required to login",
    path: ["email"],
  });
