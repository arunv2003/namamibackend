import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const taskTypeSchema = sequelize.define(
  "task_types",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    task_type_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
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
      beforeValidate: (taskType) => {
        if (!taskType.task_type_id) {
          taskType.task_type_id = generateUniqueId("TSKT");
        }
        if (!taskType.slug) {
          taskType.slug = generateSlug(taskType.name || "task-type");
        }
      },
    },
  }
);