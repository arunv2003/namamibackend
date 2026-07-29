import {
  customerSchema,
  employeeSchema,
  RoleSchema,
} from "../../../core/models/index.js";
import { ApiError } from "../../../core/utils/api.Errors.js";
import { Op } from "sequelize";
import { generateSlug } from "../../../core/utils/slug.Generate.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";

const includeOptions = [
  {
    model: employeeSchema,
    as: "ownerDetails",
    attributes: ["id", "name", "identity", "email", "mobile"],
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

const formatAudit = (instance) => {
  if (!instance) return instance;
  const item = typeof instance.toJSON === "function" ? instance.toJSON() : { ...instance };
  if (item.ownerDetails !== undefined) {
    item.owner = item.ownerDetails;
    delete item.ownerDetails;
  }
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

export const customerService = {

  getCustomersForm: async (roleSlug) => {
    const isEmployee = roleSlug && String(roleSlug).toLowerCase() === "employee";

    const employeeFields = [
      {
        name: "name",
        label: "Customer Name",
        type: "text",
        placeholder: "Enter customer name",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Enter email address",
        required: false,
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "text",
        placeholder: "Enter phone number",
        required: false,
      },
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "Enter location",
        required: false,
      },
      {
        name: "district",
        label: "District",
        type: "text",
        placeholder: "Enter district",
        required: false,
      },
      {
        name: "state",
        label: "State",
        type: "text",
        placeholder: "Enter state",
        required: false,
      },
      {
        name: "sub_state",
        label: "Sub State",
        type: "text",
        placeholder: "Enter sub state",
        required: false,
      },
      {
        name: "branch_code",
        label: "Branch Code",
        type: "text",
        placeholder: "Enter branch code",
        required: false,
      },
      {
        name: "branch",
        label: "Branch",
        type: "text",
        placeholder: "Enter branch",
        required: false,
      },
      {
        name: "center",
        label: "Center",
        type: "text",
        placeholder: "Enter center",
        required: false,
      },
      {
        name: "center_code",
        label: "Center Code",
        type: "text",
        placeholder: "Enter center code",
        required: false,
      },
      {
        name: "loanType",
        label: "Loan Type",
        type: "text",
        placeholder: "Enter loan type",
        required: false,
      },
      {
        name: "loanNo",
        label: "Loan Number",
        type: "text",
        placeholder: "Enter loan number",
        required: false,
      },
      {
        name: "oldLoanNo",
        label: "Old Loan Number",
        type: "text",
        placeholder: "Enter old loan number",
        required: false,
      },
      {
        name: "oldCustomerNo",
        label: "Old Customer Number",
        type: "text",
        placeholder: "Enter old customer number",
        required: false,
      },
      {
        name: "image",
        label: "Image URL",
        type: "text",
        placeholder: "Enter image URL",
        required: false,
      },
      {
        name: "cycle",
        label: "Cycle",
        type: "number",
        placeholder: "Enter cycle",
        required: false,
      },
      {
        name: "loanDisbDate",
        label: "Loan Disbursement Date",
        type: "date",
        required: false,
      },
      {
        name: "loanAmount",
        label: "Loan Amount",
        type: "number",
        placeholder: "Enter loan amount",
        required: false,
      },
      {
        name: "os_principal",
        label: "OS Principal",
        type: "number",
        placeholder: "Enter OS principal",
        required: false,
      },
      {
        name: "os_interest",
        label: "OS Interest",
        type: "number",
        placeholder: "Enter OS interest",
        required: false,
      },
      {
        name: "par",
        label: "PAR",
        type: "number",
        placeholder: "Enter PAR",
        required: false,
      },
      {
        name: "od_principal",
        label: "OD Principal",
        type: "number",
        placeholder: "Enter OD principal",
        required: false,
      },
      {
        name: "od_interest",
        label: "OD Interest",
        type: "number",
        placeholder: "Enter OD interest",
        required: false,
      },
      {
        name: "totalDueAmount",
        label: "Total Due Amount",
        type: "number",
        placeholder: "Enter total due amount",
        required: false,
      },
      {
        name: "total_principal_collectible",
        label: "Total Principal Collectible",
        type: "number",
        placeholder: "Enter total principal collectible",
        required: false,
      },
      {
        name: "total_interest_collectible",
        label: "Total Interest Collectible",
        type: "number",
        placeholder: "Enter total interest collectible",
        required: false,
      },
      {
        name: "irrRate",
        label: "IRR Rate",
        type: "number",
        placeholder: "Enter IRR rate",
        required: false,
      },
      {
        name: "noOfInstallment",
        label: "No. of Installments",
        type: "number",
        placeholder: "Enter number of installments",
        required: false,
      },
      {
        name: "lastDueDate",
        label: "Last Due Date",
        type: "date",
        required: false,
      },
      {
        name: "lastPaidTrxDate",
        label: "Last Paid Transaction Date",
        type: "date",
        required: false,
      },
      {
        name: "dpd",
        label: "DPD",
        type: "number",
        placeholder: "Enter DPD",
        required: false,
      },
      {
        name: "paidInstNo",
        label: "Paid Installment No.",
        type: "text",
        placeholder: "Enter paid installment number",
        required: false,
      },
      {
        name: "loanStatus",
        label: "Loan Status",
        type: "select",
        required: false,
        options: [
          { label: "Open", value: "Open" },
          { label: "Closed", value: "Closed" },
        ],
      },
      {
        name: "spouseName",
        label: "Spouse Name",
        type: "text",
        placeholder: "Enter spouse name",
        required: false,
      },
      {
        name: "installmentAmount",
        label: "Installment Amount",
        type: "number",
        placeholder: "Enter installment amount",
        required: false,
      },
      {
        name: "maturityDate",
        label: "Maturity Date",
        type: "date",
        required: false,
      },
      {
        name: "pincode",
        label: "Pincode",
        type: "text",
        placeholder: "Enter pincode",
        required: false,
      },
      {
        name: "preClosureAmt",
        label: "Pre-Closure Amount",
        type: "number",
        placeholder: "Enter pre-closure amount",
        required: false,
      },
      {
        name: "closedDate",
        label: "Closed Date",
        type: "date",
        required: false,
      },
    ];

    if (isEmployee) {
      return {
        title: "Customer Form",
        fields: employeeFields,
      };
    }

    const fullFields = [
      ...employeeFields,
      {
        name: "owner",
        label: "Owner ID",
        type: "number",
        placeholder: "Enter owner ID",
        required: false,
      },
    ];

    return {
      title: "Customer Form",
      fields: fullFields,
    };
  },


  createCustomer: async (customerData, userId) => {
    // Check for duplicate phone or email if provided
    if (customerData.email) {
      const existingEmail = await customerSchema.findOne({
        where: { email: customerData.email },
      });
      if (existingEmail) {
        throw new ApiError(
          400,
          `Customer with email '${customerData.email}' already exists`,
        );
      }
    }
    let slug = generateSlug(customerData.name || "customer");
    let slugExists = await customerSchema.findOne({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(customerData.name || "customer");
      slugExists = await customerSchema.findOne({ where: { slug } });
    }

    let customer_id = generateUniqueId("CUST");
    let customerIdExists = await customerSchema.findOne({ where: { customer_id } });
    while (customerIdExists) {
      customer_id = generateUniqueId("CUST");
      customerIdExists = await customerSchema.findOne({ where: { customer_id } });
    }

    if (customerData.phone) {
      const existingPhone = await customerSchema.findOne({
        where: { phone: customerData.phone },
      });
      if (existingPhone) {
        throw new ApiError(
          400,
          `Customer with phone '${customerData.phone}' already exists`,
        );
      }
    }

    const customer = await customerSchema.create({
      ...customerData,
      customer_id,
      slug: slug,
      createdBy: userId || customerData.createdBy,
      updatedBy: userId || customerData.updatedBy,
    });
    return formatAudit(customer);
  },

  getCustomers: async (queryParams, userId, roleId) => {
    const {
      page = 1,
      limit = 10,
      search,
      loanStatus,
      branch,
      center,
    } = queryParams;


    const isAll = limit === "all" || limit === "0" || limit === 0;
    const parsedLimit = isAll ? null : parseInt(limit, 10);
    const parsedPage = parseInt(page, 10) || 1;
    const offset = isAll ? 0 : (parsedPage - 1) * (parsedLimit || 10);

    const role = roleId ? await RoleSchema.findByPk(roleId) : null;
    const isAdmin =
      role &&
      (role.slug?.toLowerCase() === "admin" ||
        role.name?.toLowerCase() === "admin");

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { loanNo: { [Op.like]: `%${search}%` } },
        { oldLoanNo: { [Op.like]: `%${search}%` } },
      ];
    }

    if (loanStatus) {
      where.loanStatus = loanStatus;
    }

    if (branch) {
      where.branch = branch;
    }

    if (center) {
      where.center = center;
    }

    if (!isAdmin) {
      where.createdBy = userId;
    }

    const queryOptions = {
      where,
      order: [["createdAt", "DESC"]],
      include: includeOptions,
    };

    if (parsedLimit) {
      queryOptions.limit = parsedLimit;
      queryOptions.offset = offset;
    }

    const { count, rows } = await customerSchema.findAndCountAll(queryOptions);

    return {
      totalItems: count,
      totalPages: parsedLimit ? Math.ceil(count / parsedLimit) : 1,
      currentPage: parsedPage,
      customers: rows.map(formatAudit),
    };
  },

  getCustomerBySlug: async (slug) => {
    let customer;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      customer = await customerSchema.findByPk(slug, {
        include: includeOptions,
      });
    } else {
      customer = await customerSchema.findOne({
        where: { slug },
        include: includeOptions,
      });
    }

    if (!customer) {
      throw new ApiError(404, `Customer with identifier '${slug}' not found`);
    }

    return formatAudit(customer);
  },

  getCustomerById: async (id) => {
    return customerService.getCustomerBySlug(id);
  },

  updateCustomer: async (slug, updateData, userId) => {
    let customer;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      customer = await customerSchema.findByPk(slug);
    } else {
      customer = await customerSchema.findOne({ where: { slug } });
    }

    if (!customer) {
      throw new ApiError(404, `Customer with identifier '${slug}' not found`);
    }

    const id = customer.id;

    if (updateData.email && updateData.email !== customer.email) {
      const emailExists = await customerSchema.findOne({
        where: {
          email: updateData.email,
          id: { [Op.ne]: id },
        },
      });
      if (emailExists) {
        throw new ApiError(
          400,
          `Customer with email '${updateData.email}' already exists`,
        );
      }
    }

    if (updateData.phone && updateData.phone !== customer.phone) {
      const phoneExists = await customerSchema.findOne({
        where: {
          phone: updateData.phone,
          id: { [Op.ne]: id },
        },
      });
      if (phoneExists) {
        throw new ApiError(
          400,
          `Customer with phone '${updateData.phone}' already exists`,
        );
      }
    }

    if (userId) {
      updateData.updatedBy = userId;
    }

    await customer.update(updateData);
    const updatedCustomer = await customerSchema.findByPk(id, {
      include: includeOptions,
    });
    return formatAudit(updatedCustomer);
  },

  deleteCustomer: async (slug) => {
    let customer;
    const isId = !isNaN(slug) && !isNaN(parseFloat(slug));

    if (isId) {
      customer = await customerSchema.findByPk(slug);
    } else {
      customer = await customerSchema.findOne({ where: { slug } });
    }

    if (!customer) {
      throw new ApiError(404, `Customer with identifier '${slug}' not found`);
    }

    await customer.destroy();
    return true;
  },
};

export default customerService;
