import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";
import { generateUniqueId } from "../../../core/utils/generateUniqueId.js";
import { generateSlug } from "../../../core/utils/slug.Generate.js";

export const RoleSchema = sequelize.define(
    "roles",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        role_custom_id: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
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
        permission: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
        timestamps: true,
        hooks: {
            beforeValidate: (role) => {
                if (!role.role_custom_id) {
                    role.role_custom_id = generateUniqueId("ROL");
                }
                if (!role.slug) {
                    role.slug = generateSlug(role.name || "role");
                }
            },
        },
    },
);

