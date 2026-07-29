import { sequelize } from "../../../core/config/db.js";
import DataTypes from "sequelize";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const taskSchema = sequelize.define(
  "tasks",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    task_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    taskType: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    assigneeToEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    startDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    repeat: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM("hour", "day", "week", "month", "year"),
      allowNull: true,
    },
    interval: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    payment_type: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    // ── Completion Form Fields ──────────────────────────────────────────────
    houseImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    relation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    clientPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    collectPayment: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clientSegment: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ptpdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentProfImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    completeDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // ───────────────────────────────────────────────────────────────────────

    additionalFields: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in-progress", "completed"),
      defaultValue: "pending",
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
      beforeValidate: (task) => {
        if (!task.task_id) {
          task.task_id = generateUniqueId("TSK");
        }
        if (!task.slug) {
          task.slug = generateSlug(task.description || "task");
        }
      },
    },
  },
);


