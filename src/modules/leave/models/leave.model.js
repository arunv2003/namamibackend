import { DataTypes } from "sequelize";
import { sequelize } from "../../../core/config/db.js";

export const leaveSchema = sequelize.define("leaves", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    emp_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dayType:{
        type:DataTypes.ENUM('full_day','half_day'),
        allowNull:false,
        defaultValue:'full_day'
    },
    duration:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    from_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    to_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    actionOn: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actionBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    appliedOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reason:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    remark:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    attachment:{
        type:DataTypes.STRING,
        allowNull:true
    }

}, { timestamps: true });
