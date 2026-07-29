import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const stateSchema = sequelize.define(
  "states",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    state_custom_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
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
      beforeValidate: (state) => {
        if (!state.state_custom_id) {
          state.state_custom_id = generateUniqueId("ST");
        }
        if (!state.slug) {
          state.slug = generateSlug(state.name || "state");
        }
      },
    },
  },
);

