import { sequelize } from "../../../core/config/db.js";
import DataTypes from "sequelize";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const employeeSchema = sequelize.define(
  "employees",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    emp_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    identity: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    department: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    team: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      defaultValue: "male",
      allowNull: true,
    },
    blood_group: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    label_color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    designations: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "+91",
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    work_shift: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "active", "inactive", "on_leave", "terminated"),
      allowNull: false,
      defaultValue: "pending",
    },
    work_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    emp_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    business_unit: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    license: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cost_center: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "type",
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "type",
    },
    punchIn: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    punchOut: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    entryAlerts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    exitAlerts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    app_version: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    desktop_version: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_desktop_started_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    last_Sync_desktop_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    last_Sync_mobile: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    last_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_of_joining: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
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
      beforeValidate: (employee) => {
        if (!employee.emp_id) {
          employee.emp_id = generateUniqueId("EMP");
        }
        if (!employee.slug) {
          employee.slug = generateSlug(employee.name || "employee");
        }
      },
    },
  },
);
