import {
  employeeSchema,
  RoleSchema,
  stateSchema,
  regionSchema,
  branchSchema,
  officeSchema,
  customerSchema,
} from "../../../core/models/index.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import bcrypt from "bcrypt";
import { generateAccessAndRefreshTokens } from "../../../core/utils/token.Generate.js";
import { Op } from "sequelize";
import countryCodes from "country-codes-list";

const getCountryFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const countryCodeListMap = countryCodes.customList("countryCallingCode", "{countryCode} +{countryCallingCode}");
const countryCodeOptions = Object.entries(countryCodeListMap).map(([code, label]) => {
  const isoCode = label.split(" ")[0] || "";
  const flagUrl = `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
  return {
    label: `${isoCode} +${code.trim()}`.trim(),
    value: `+${code.trim()}`,
    code: isoCode,
    flag: flagUrl,
  };
});

const getDefaultEmployeeIncludes = () => [
  {
    model: employeeSchema,
    as: "manager",
    attributes: ["id", "name", "identity", "email", "mobile", "designations"],
    required: false,
  },
  {
    model: employeeSchema,
    as: "creator",
    attributes: ["id", "name", "identity"],
    required: false,
  },
  {
    model: RoleSchema,
    as: "role",
    attributes: ["id", "name", "slug"],
    required: false,
  },
  {
    model: employeeSchema,
    as: "updater",
    attributes: ["id", "name", "identity"],
    required: false,
  },
  {
    model: stateSchema,
    as: "state",
    attributes: ["id", "name", "slug"],
    required: false,
  },
  {
    model: regionSchema,
    as: "region",
    attributes: ["id", "name", "slug"],
    required: false,
  },
  {
    model: branchSchema,
    as: "branch",
    attributes: ["id", "name", "slug"],
    required: false,
  },
];

const formatEmployeeAudit = (employeeInstance) => {
  if (!employeeInstance) return employeeInstance;
  const item = typeof employeeInstance.toJSON === "function" ? employeeInstance.toJSON() : { ...employeeInstance };
  delete item.password;

  if (item.role !== undefined) {
    item.type = item.role;
    delete item.role;
  }
  if (item.manager !== undefined) {
    item.manager_id = item.manager;
    delete item.manager;
  }
  if (item.creator !== undefined) {
    item.createdBy = item.creator;
    delete item.creator;
  }
  if (item.updater !== undefined) {
    item.updatedBy = item.updater;
    delete item.updater;
  }
  if (item.state !== undefined) {
    item.state_id = item.state;
    delete item.state;
  }
  if (item.region !== undefined) {
    item.region_id = item.region;
    delete item.region;
  }
  if (item.branch !== undefined) {
    item.branch_id = item.branch;
    delete item.branch;
  }
  if (!item.mobileCountryCode && item.country_code) {
    item.mobileCountryCode = item.country_code;
  }
  if (!item.thumbnail && item.image) {
    item.thumbnail = item.image;
  }
  return item;
};

const formatEmployeeAuditWithOffices = async (employeeInstance) => {
  const item = formatEmployeeAudit(employeeInstance);
  if (!item) return item;

  const officeIdSet = new Set();
  const geofenceKeys = ["punchIn", "punchOut", "entryAlerts", "exitAlerts"];

  geofenceKeys.forEach((key) => {
    if (Array.isArray(item[key])) {
      item[key].forEach((val) => {
        if (val !== null && val !== undefined && val !== "") {
          officeIdSet.add(val);
        }
      });
    }
  });

  if (officeIdSet.size > 0) {
    const rawList = Array.from(officeIdSet);
    const numericIds = rawList.filter((x) => typeof x === "number" || (!isNaN(Number(x)) && String(x).trim() !== "")).map(Number);
    const stringNames = rawList.map(String);

    const whereConditions = [];
    if (numericIds.length > 0) whereConditions.push({ id: numericIds });
    if (stringNames.length > 0) whereConditions.push({ name: stringNames });

    const offices = await officeSchema.findAll({
      where: whereConditions.length > 1 ? { [Op.or]: whereConditions } : (whereConditions[0] || {}),
      attributes: ["id", "name", "address", "latitude", "longitude", "radius", "slug"],
    });

    const officeMap = {};
    offices.forEach((off) => {
      const plain = typeof off.toJSON === "function" ? off.toJSON() : off;
      officeMap[plain.id] = plain;
      officeMap[plain.name] = plain;
    });

    geofenceKeys.forEach((key) => {
      if (Array.isArray(item[key])) {
        item[key] = item[key].map((val) => officeMap[val] || val);
      }
    });
  }

  return item;
};

const formatEmployeesAuditWithOffices = async (employeeRows) => {
  const formattedItems = employeeRows.map(formatEmployeeAudit);
  const officeIdSet = new Set();
  const geofenceKeys = ["punchIn", "punchOut", "entryAlerts", "exitAlerts"];

  formattedItems.forEach((item) => {
    geofenceKeys.forEach((key) => {
      if (Array.isArray(item[key])) {
        item[key].forEach((val) => {
          if (val !== null && val !== undefined && val !== "") {
            officeIdSet.add(val);
          }
        });
      }
    });
  });

  if (officeIdSet.size > 0) {
    const rawList = Array.from(officeIdSet);
    const numericIds = rawList.filter((x) => typeof x === "number" || (!isNaN(Number(x)) && String(x).trim() !== "")).map(Number);
    const stringNames = rawList.map(String);

    const whereConditions = [];
    if (numericIds.length > 0) whereConditions.push({ id: numericIds });
    if (stringNames.length > 0) whereConditions.push({ name: stringNames });

    const offices = await officeSchema.findAll({
      where: whereConditions.length > 1 ? { [Op.or]: whereConditions } : (whereConditions[0] || {}),
      attributes: ["id", "name", "address", "latitude", "longitude", "radius", "slug"],
    });

    const officeMap = {};
    offices.forEach((off) => {
      const plain = typeof off.toJSON === "function" ? off.toJSON() : off;
      officeMap[plain.id] = plain;
      officeMap[plain.name] = plain;
    });

    formattedItems.forEach((item) => {
      geofenceKeys.forEach((key) => {
        if (Array.isArray(item[key])) {
          item[key] = item[key].map((val) => officeMap[val] || val);
        }
      });
    });
  }

  return formattedItems;
};

export const employeeService = {

  getEmployeeFields: async () => {
    const [roles, states, regions, branches, offices, managers] = await Promise.all([
      RoleSchema.findAll({ attributes: ["id", "name"], raw: true }).catch(() => []),
      stateSchema.findAll({ attributes: ["id", "name"], raw: true }).catch(() => []),
      regionSchema.findAll({ attributes: ["id", "name"], raw: true }).catch(() => []),
      branchSchema.findAll({ attributes: ["id", "name"], raw: true }).catch(() => []),
      officeSchema.findAll({ attributes: ["id", "name"], raw: true }).catch(() => []),
      employeeSchema.findAll({ attributes: ["id", "name", "identity", "email"], raw: true }).catch(() => []),
    ]);
    const fields = [
      // Create Employee Section
      {
        name: "name",
        label: "Name",
        type: "text",
        placeholder: "Enter Name",
        required: true,
        section: "Create Employee",
      },
      {
        name: "identity",
        label: "Identifier",
        type: "text",
        placeholder: "Enter Identifier",
        required: true,
        section: "Create Employee",
      },
      {
        name: "loginId",
        label: "Login Id",
        type: "text",
        placeholder: "Enter Login Id",
        required: true,
        section: "Create Employee",
      },
      {
        name: "mobileCountryCode",
        label: "Country Code",
        type: "select",
        required: false,
        section: "Create Employee",
        options: countryCodeOptions,
      },
      {
        name: "mobile",
        label: "Mobile",
        type: "text",
        placeholder: "Enter Mobile Number",
        required: false,
        section: "Create Employee",
      },
      {
        name: "type",
        label: "Role / Type",
        type: "select",
        required: true,
        section: "Create Employee",
        options: roles.map((r) => ({ label: r.name, value: r.id })),
      },

      {
        name: "manager_id",
        label: "Reporting Manager",
        type: "select",
        required: false,
        section: "Create Employee",
        options: managers.map((m) => ({ label: `${m.name} (${m.identity || m.email || m.id})`, value: m.id })),
      },
      {
        name: "license",
        label: "License",
        type: "select",
        required: true,
        section: "Create Employee",
        options: [
          { label: "Full Access License", value: "Full Access License" },
          { label: "Standard License", value: "Standard License" },
          { label: "Basic License", value: "Basic License" },
        ],
      },
      {
        name: "enablePassword",
        label: "Password Switch",
        type: "switch",
        required: false,
        section: "Create Employee",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter Password",
        required: false,
        section: "Create Employee",
        dependsOnSwitch: "enablePassword",
      },
      {
        name: "thumbnail",
        label: "Thumbnail",
        type: "file",
        required: false,
        section: "Create Employee",
      },

      // Tag Details Section
      {
        name: "state",
        label: "State Name & Id",
        type: "select",
        required: false,
        section: "Tag Details",
        options: states.map((s) => ({ label: `${s.name} (ST-${s.id})`, value: s.id })),
      },
      {
        name: "region",
        label: "Region Name & Id",
        type: "select",
        required: false,
        section: "Tag Details",
        dependsOnField: "state",
        options: regions.map((r) => ({ label: `${r.name} (RG-${r.id})`, value: r.id })),
      },
      {
        name: "branchTag",
        label: "Branch Name & Id",
        type: "select",
        required: false,
        section: "Tag Details",
        dependsOnField: "region",
        options: branches.map((b) => ({ label: `${b.name} (BR-${b.id})`, value: b.id })),
      },

      // Advance Settings Switch
      {
        name: "enableAdvanceSettings",
        label: "Advance Setting",
        type: "switch",
        required: false,
        section: "Advance Settings",
      },

      // Personal Details Section (Advance)
      {
        name: "branch",
        label: "Branch",
        type: "select",
        required: false,
        section: "Personal Details",
        dependsOnSwitch: "enableAdvanceSettings",
        options: branches.map((b) => ({ label: b.name, value: b.name })),
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        section: "Personal Details",
        dependsOnSwitch: "enableAdvanceSettings",
        options: [
          { label: "Male", value: "Male" },
          { label: "Female", value: "Female" },
          { label: "Other", value: "Other" },
        ],
      },
      {
        name: "bloodGroup",
        label: "Blood Group",
        type: "select",
        required: false,
        section: "Personal Details",
        dependsOnSwitch: "enableAdvanceSettings",
        options: [
          { label: "A+", value: "A+" },
          { label: "A-", value: "A-" },
          { label: "B+", value: "B+" },
          { label: "B-", value: "B-" },
          { label: "AB+", value: "AB+" },
          { label: "AB-", value: "AB-" },
          { label: "O+", value: "O+" },
          { label: "O-", value: "O-" },
        ],
      },
      {
        name: "label",
        label: "Label",
        type: "text",
        placeholder: "Select or Enter Label",
        required: true,
        section: "Personal Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },
      {
        name: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        required: false,
        section: "Personal Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },
      {
        name: "dateOfJoining",
        label: "Date of Joining",
        type: "date",
        required: true,
        section: "Personal Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter Address",
        required: false,
        section: "Personal Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },

      // Geo Fence Restriction Section (Advance)
      {
        name: "punchInGeoFence",
        label: "Punch In Geo Fence",
        type: "multiselect",
        multiple: true,
        required: false,
        section: "Geo Fence Restriction",
        dependsOnSwitch: "enableAdvanceSettings",
        options: offices.map((o) => ({ label: o.name, value: o.id })),
      },
      {
        name: "punchOutGeoFence",
        label: "Punch Out Geo Fence",
        type: "multiselect",
        multiple: true,
        required: false,
        section: "Geo Fence Restriction",
        dependsOnSwitch: "enableAdvanceSettings",
        options: offices.map((o) => ({ label: o.name, value: o.id })),
      },
      {
        name: "entryAlertGeoFence",
        label: "Entry Alert Geo Fence",
        type: "multiselect",
        multiple: true,
        required: false,
        section: "Geo Fence Restriction",
        dependsOnSwitch: "enableAdvanceSettings",
        options: offices.map((o) => ({ label: o.name, value: o.id })),
      },
      {
        name: "exitAlertGeoFence",
        label: "Exit Alert Geo Fence",
        type: "multiselect",
        multiple: true,
        required: false,
        section: "Geo Fence Restriction",
        dependsOnSwitch: "enableAdvanceSettings",
        options: offices.map((o) => ({ label: o.name, value: o.id })),
      },

      // Additional Details Section (Advance)
      {
        name: "homeLocation",
        label: "Home Location",
        type: "google_map",
        placeholder: "Search or enter location",
        required: false,
        section: "Additional Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },

      // Other Details Section (Advance)
      {
        name: "workingShift",
        label: "Working Shift",
        type: "select",
        required: true,
        section: "Other Details",
        dependsOnSwitch: "enableAdvanceSettings",
        options: [
          { label: "General Shift (9 AM - 6 PM)", value: "General Shift (9 AM - 6 PM)" },
          { label: "Night Shift (10 PM - 7 AM)", value: "Night Shift (10 PM - 7 AM)" },
        ],
      },
      {
        name: "leaveProfile",
        label: "Leave Profile",
        type: "select",
        required: true,
        section: "Other Details",
        dependsOnSwitch: "enableAdvanceSettings",
        options: [
          { label: "Standard Policy", value: "Standard Policy" },
          { label: "Executive Policy", value: "Executive Policy" },
        ],
      },
      {
        name: "tracker",
        label: "Tracker",
        type: "switch",
        required: false,
        section: "Other Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },
      {
        name: "trackerWebsite",
        label: "Tracker Website?",
        type: "switch",
        required: false,
        section: "Other Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },
      {
        name: "disableAutoPunchOut",
        label: "Disable Auto Punch Out",
        type: "switch",
        required: false,
        section: "Other Details",
        dependsOnSwitch: "enableAdvanceSettings",
      },

      // Customer Filters Section (Advance)
      {
        name: "customerFilters",
        label: "Customer Filters",
        type: "customer_filters",
        required: false,
        section: "Customer Filters",
        dependsOnSwitch: "enableAdvanceSettings",
        options: {
          tags: [
            { label: "Region", value: "Region" },
            { label: "Tier", value: "Tier" },
          ],
          conditions: [
            { label: "Equals", value: "Equals" },
            { label: "Contains", value: "Contains" },
          ],
        },
      },

      // Override Shift Timing Section
      {
        name: "maxPunchInTime",
        label: "Max Punch In Time",
        type: "time",
        placeholder: "Please select time",
        required: false,
        section: "Override Shift Timing",
      },
    ];

    return {
      title: "Employee Form",
      fields,
    };
  },


  createEmployee: async (employeeData, userId) => {


    const existingEmail = await employeeSchema.findOne({
      where: { email: employeeData.email }
    });
    if (existingEmail) {
      throw new ApiError(400, `Employee with email '${employeeData.email}' already exists`);
    }

    // 2. Check if identity already exists
    const existingIdentity = await employeeSchema.findOne({
      where: { identity: employeeData.identity }
    });
    if (existingIdentity) {
      throw new ApiError(400, `Employee with identity '${employeeData.identity}' already exists`);
    }

    // Generate unique slug & emp_id
    let slug = generateSlug(employeeData.name);
    let slugExists = await employeeSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(employeeData.name);
      slugExists = await employeeSchema.findOne({ where: { slug } });
    }

    let emp_id = generateUniqueId("EMP");
    let empIdExists = await employeeSchema.findOne({ where: { emp_id } });
    while (empIdExists) {
      emp_id = generateUniqueId("EMP");
      empIdExists = await employeeSchema.findOne({ where: { emp_id } });
    }

    // 3. Hash password (use default '123456' if omitted)
    const rawPassword = employeeData.password || "123456";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 4. Save to database
    const punchInVal = employeeData.punchInGeoFence ?? employeeData.punchIn ?? [];
    const punchOutVal = employeeData.punchOutGeoFence ?? employeeData.punchOut ?? [];
    const entryAlertsVal = employeeData.entryAlertGeoFence ?? employeeData.entryAlerts ?? [];
    const exitAlertsVal = employeeData.exitAlertGeoFence ?? employeeData.exitAlerts ?? [];

    const finalPunchIn = Array.isArray(punchInVal) ? punchInVal : (punchInVal ? [punchInVal] : []);
    const finalPunchOut = Array.isArray(punchOutVal) ? punchOutVal : (punchOutVal ? [punchOutVal] : []);
    const finalEntryAlerts = Array.isArray(entryAlertsVal) ? entryAlertsVal : (entryAlertsVal ? [entryAlertsVal] : []);
    const finalExitAlerts = Array.isArray(exitAlertsVal) ? exitAlertsVal : (exitAlertsVal ? [exitAlertsVal] : []);

    const countryCodeVal = employeeData.country_code || employeeData.mobileCountryCode || "+91";
    const imageVal = employeeData.image || employeeData.thumbnail || null;

    const employee = await employeeSchema.create({
      ...employeeData,
      country_code: countryCodeVal,
      image: imageVal,
      punchIn: finalPunchIn,
      punchOut: finalPunchOut,
      entryAlerts: finalEntryAlerts,
      exitAlerts: finalExitAlerts,
      password: hashedPassword,
      emp_id,
      slug,
      createdBy: userId || employeeData.createdBy,
      updatedBy: userId || employeeData.updatedBy
    });

    const createdEmployee = await employeeSchema.findByPk(employee.id, {
      attributes: { exclude: ['password'] },
      include: getDefaultEmployeeIncludes()
    });

    // 5. Return employee data excluding password with formatted references
    return await formatEmployeeAuditWithOffices(createdEmployee);
  },


  getEmployees: async (queryParams, user) => {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      status,
      role_id,
      type,
      branch_id
    } = queryParams;

    const roleId = user?.type || user?.role_id;
    const role = roleId ? await RoleSchema.findByPk(roleId) : null;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { identity: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
      ];
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }



    if (role && role.slug !== "admin" && role.name !== "admin") {
      if (user?.id) {
        where.createdBy = user.id;
      }
    }

    if (role_id || type) {
      where.type = parseInt(role_id || type, 10);
    }

    if (branch_id) {
      where.branch_id = parseInt(branch_id, 10);
    }

    const { count, rows } = await employeeSchema.findAndCountAll({
      where,
      distinct: true,
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
      include: getDefaultEmployeeIncludes()
    });

    const formattedEmployees = await formatEmployeesAuditWithOffices(rows);

    // console.log(formattedEmployees, "formattedEmployeesformattedEmployeesformattedEmployees")

    return {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      employees: formattedEmployees
    };
  },

  getEmployeeContactWithCustomer: async (queryParams = {}, user) => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      onlyWithCustomer,
    } = queryParams;

    const isAll = limit === "all" || limit === "0" || limit === 0;
    const parsedLimit = isAll ? null : parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = isAll ? 0 : (parsedPage - 1) * (parsedLimit || 10);

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { identity: { [Op.like]: `%${search}%` } },
        { emp_id: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const isRequired = onlyWithCustomer === "true" || onlyWithCustomer === true;

    const queryOptions = {
      where,
      attributes: ["id", "emp_id", "name", "email", "mobile", "country_code", "createdAt"],
      include: [
        {
          model: customerSchema,
          as: "ownedCustomers",
          attributes: ["id", "customer_id", "name", "email", "phone", "slug"],
          required: isRequired,
        },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
    };

    if (parsedLimit) {
      queryOptions.limit = parsedLimit;
      queryOptions.offset = offset;
    }

    const { count, rows } = await employeeSchema.findAndCountAll(queryOptions);

    const formattedContacts = rows.map((emp) => {
      const item = typeof emp.toJSON === "function" ? emp.toJSON() : { ...emp };
      const ownedCustomers = item.ownedCustomers || [];
      const hasCustomer = ownedCustomers.length > 0;

      const contactLink = hasCustomer
        ? ownedCustomers.map((c) => c.customer_id || c.id).join(", ")
        : null;

      return {
        id: item.id,
        emp_id: item.emp_id,
        name: item.name,
        email: item.email,
        mobile: item.mobile,
        mobileNumber: item.mobile,
        country_code: item.country_code || "+91",
        countryCode: item.country_code || "+91",
        mobileCountryCode: item.country_code || "+91",
        createdAt: item.createdAt,
        contactLink: contactLink,
        isCustomerOwner: hasCustomer,
        ownedCustomers: ownedCustomers,
      };
    });

    return {
      totalItems: count,
      totalPages: parsedLimit ? Math.ceil(count / parsedLimit) : 1,
      currentPage: parsedPage,
      employees: formattedContacts,
    };
  },



  getEmployeeBySlug: async (slug) => {
    let employee;

    // Check if slug is a number or numeric string
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      employee = await employeeSchema.findByPk(slug, {
        attributes: { exclude: ['password'] },
        include: defaultEmployeeIncludes
      });
    } else {
      employee = await employeeSchema.findOne({
        where: { slug: slug },
        attributes: { exclude: ['password'] },
        include: getDefaultEmployeeIncludes()
      });
    }

    if (!employee) {
      throw new ApiError(404, `Employee with identifier '${slug}' not found`);
    }

    return await formatEmployeeAuditWithOffices(employee);
  },


  updateEmployee: async (slug, updateData, userId) => {
    let employee;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      employee = await employeeSchema.findByPk(slug);
    } else {
      employee = await employeeSchema.findOne({ where: { slug: slug } });
    }

    if (!employee) {
      throw new ApiError(404, `Employee with identifier '${slug}' not found`);
    }

    delete updateData.slug;
    const id = employee.id;

    // If updating email, check if it's taken by another employee
    if (updateData.email && updateData.email !== employee.email) {
      const emailExists = await employeeSchema.findOne({
        where: {
          email: updateData.email,
          id: { [Op.ne]: id }
        }
      });
      if (emailExists) {
        throw new ApiError(400, `Email '${updateData.email}' is already in use`);
      }
    }

    // If updating identity, check if it's taken by another employee
    if (updateData.identity && updateData.identity !== employee.identity) {
      const identityExists = await employeeSchema.findOne({
        where: {
          identity: updateData.identity,
          id: { [Op.ne]: id }
        }
      });
      if (identityExists) {
        throw new ApiError(400, `Identity '${updateData.identity}' is already in use`);
      }
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    if (updateData.mobileCountryCode && !updateData.country_code) {
      updateData.country_code = updateData.mobileCountryCode;
    }
    if (updateData.thumbnail && !updateData.image) {
      updateData.image = updateData.thumbnail;
    }

    if (updateData.punchInGeoFence !== undefined || updateData.punchIn !== undefined) {
      const val = updateData.punchInGeoFence ?? updateData.punchIn;
      updateData.punchIn = Array.isArray(val) ? val : (val ? [val] : []);
      delete updateData.punchInGeoFence;
    }
    if (updateData.punchOutGeoFence !== undefined || updateData.punchOut !== undefined) {
      const val = updateData.punchOutGeoFence ?? updateData.punchOut;
      updateData.punchOut = Array.isArray(val) ? val : (val ? [val] : []);
      delete updateData.punchOutGeoFence;
    }
    if (updateData.entryAlertGeoFence !== undefined || updateData.entryAlerts !== undefined) {
      const val = updateData.entryAlertGeoFence ?? updateData.entryAlerts;
      updateData.entryAlerts = Array.isArray(val) ? val : (val ? [val] : []);
      delete updateData.entryAlertGeoFence;
    }
    if (updateData.exitAlertGeoFence !== undefined || updateData.exitAlerts !== undefined) {
      const val = updateData.exitAlertGeoFence ?? updateData.exitAlerts;
      updateData.exitAlerts = Array.isArray(val) ? val : (val ? [val] : []);
      delete updateData.exitAlertGeoFence;
    }

    await employee.update(updateData);

    const updatedEmployee = await employeeSchema.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: getDefaultEmployeeIncludes()
    });

    return await formatEmployeeAuditWithOffices(updatedEmployee);
  },


  deleteEmployee: async (slug) => {
    let employee;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      employee = await employeeSchema.findByPk(slug);
    } else {
      employee = await employeeSchema.findOne({ where: { slug: slug } });
    }

    if (!employee) {
      throw new ApiError(404, `Employee with identifier '${slug}' not found`);
    }

    await employee.destroy();
    return true;
  },


  loginEmployee: async ({ email, mobile, password }) => {
    const where = {};
    if (email) {
      where.email = email;
    } else if (mobile) {
      where.mobile = mobile;
    } else {
      throw new ApiError(400, "Please provide email or mobile to log in");
    }

    const employee = await employeeSchema.findOne({
      where,
      include: getDefaultEmployeeIncludes(),
    });
    if (!employee) {
      throw new ApiError(401, "Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid Credentials");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(employee);

    await employeeSchema.update({ refreshToken }, { where: { id: employee.id } });

    const employeeResponse = await formatEmployeeAuditWithOffices(employee);
    delete employeeResponse.refreshToken;

    const isProduction = process.env.NODE_ENV === "production";

    const options = {
      accessCookieOptions: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      },
      refreshCookieOptions: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      },
    };

    return {
      user: employeeResponse,
      accessToken,
      refreshToken,
      options,
    };
  },

  getPermissionByRole: async (id) => {
    console.log(id, "ididididididid")
    const role = await RoleSchema.findByPk(id, {
      attributes: { exclude: ["createdBy", "updatedBy", "createdAt", "updatedAt"] },
    });
    if (!role) {
      throw new ApiError(404, "Role not found");
    }
    return role;
  },

  logoutEmployee: async (id) => {

    const data = await employeeSchema.update({ refreshToken: null }, { where: { id } });

    console.log(data);

    const options = {
      accessCookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0, // Expire the cookie
      },
      refreshCookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0, // Expire the cookie
      },
    };

    return { options };
  }
};

export default employeeService;
