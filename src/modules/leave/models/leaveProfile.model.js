import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const leaveProfileSchema = sequelize.define(
  "leave_profiles",
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
