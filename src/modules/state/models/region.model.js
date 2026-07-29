import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const regionSchema = sequelize.define(
  "regions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    region_custom_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
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
      beforeValidate: (region) => {
        if (!region.region_custom_id) {
          region.region_custom_id = generateUniqueId("REG");
        }
        if (!region.slug) {
          region.slug = generateSlug(region.name || "region");
        }
      },
    },
  },
);

