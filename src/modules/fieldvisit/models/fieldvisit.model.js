import { sequelize } from "../../../core/config/db.js";
import { DataTypes } from "sequelize";
import { employeeSchema } from "../../employees/models/employee.model.js";

export const fieldSchema = sequelize.define(
    "field_visits",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        emp_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },


        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        purpose: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        remark: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        locations: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM("pending", "completed"),
            defaultValue: "pending",
            allowNull: false,
        }
    },
    {
        timestamps: false,
    }
);

fieldSchema.belongsTo(employeeSchema, { foreignKey: "emp_id", as: "employee" });
employeeSchema.hasMany(fieldSchema, { foreignKey: "emp_id", as: "fieldVisits" });