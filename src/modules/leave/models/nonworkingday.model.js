import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";

export const nonWorkingDaySchema = sequelize.define(
  "non_working_days",
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
    week: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    day: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    leaveProfile: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    afterapplicableDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    beforeapplicableDate: {
      type: DataTypes.DATE,
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
  }
);
