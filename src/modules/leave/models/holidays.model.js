import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const holidaySchema = sequelize.define(
  "holidays",
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
    flexible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    leaveProfile: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    slug: {
      type: DataTypes.STRING(200),
      unique: true,
      allowNull: false,
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
