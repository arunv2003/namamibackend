import { sequelize } from "../../../core/config/db.js";
import DataTypes from "sequelize";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const officeSchema = sequelize.define(
  "offices",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    office_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    latitude: {
      type: DataTypes.FLOAT(9),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT(10),
      allowNull: false,
    },
    radius: {
      type: DataTypes.FLOAT(6),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
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
      beforeValidate: (office) => {
        if (!office.office_id) {
          office.office_id = generateUniqueId("OFF");
        }
        if (!office.slug) {
          office.slug = generateSlug(office.name || "office");
        }
      },
    },
  },
);

