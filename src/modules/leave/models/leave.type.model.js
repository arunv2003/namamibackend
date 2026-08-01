import { sequelize } from "../../../core/config/db.js";
import DataTypes from "sequelize";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const leaveTypeSchema = sequelize.define(
  "leave_types",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(200),
      unique: true,
      allowNull: false,
    },
    fullDay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    halfDay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalLeave: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    openingBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    timeInterval: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "FLAT",
    },
    monthlyCreditDay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    compOff: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    birthdayLeave: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reason: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hideFromSummary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
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
      beforeValidate: (instance) => {
        if (!instance.slug && instance.name) {
          instance.slug = generateSlug(instance.name);
        }
      },
    },
  }
);

export const leaveType = leaveTypeSchema;

