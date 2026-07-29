import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const customerSchema = sequelize.define(
  "customers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: true,
      unique: true,
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    sub_state: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    branch_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    center: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    center_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    loanType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    loanNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    oldLoanNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    oldCustomerNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(10000),
      allowNull: true,
      defaultValue: null,
    },
    cycle: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    loanDisbDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    loanAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    os_principal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    os_interest: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    par: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    od_principal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    od_interest: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    totalDueAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    total_principal_collectible: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    total_interest_collectible: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    irrRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    noOfInstallment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastDueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    lastPaidTrxDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dpd: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paidInstNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "0",
    },
    loanStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Open",
    },
    spouseName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    installmentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    maturityDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    preClosureAmt: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    closedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeValidate: (customer) => {
        if (!customer.customer_id) {
          customer.customer_id = generateUniqueId("CUST");
        }
        if (!customer.slug) {
          customer.slug = generateSlug(customer.name || "customer");
        }
      },
    },
  },
);
