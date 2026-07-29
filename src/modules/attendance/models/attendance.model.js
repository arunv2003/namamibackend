import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";

export const attendanceSchema = sequelize.define(
  "attendance",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    clock_in: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    clock_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("CLOCKED_IN", "CLOCKED_OUT", "PRESENT", "ABSENT", "HALF_DAY"),
      allowNull: false,
      defaultValue: "CLOCKED_IN",
    },
    clock_in_location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    clock_out_location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    clock_in_ip: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    clock_out_ip: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    clock_in_device: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    clock_out_device: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_hours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    punchinOffice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    punchoutOffice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  { timestamps: true }
);