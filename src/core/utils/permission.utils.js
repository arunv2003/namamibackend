import { Op } from "sequelize";
import { RoleSchema as Role } from "../models/index.js";
import { ApiError } from "./api.Errors.js";

/**
 * Express Middleware: Check Permission on Route level
 * Supports:
 * - checkPermission("customer", "add")
 * - checkPermission("employee", "allEmployee", "add")
 */
export const checkPermission = (moduleName, subModuleName, action) => {
  let modName = moduleName;
  let subModName = subModuleName;
  let act = action;

  if (!act) {
    act = subModuleName;
    subModName = null;
  }
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required prior to permission check");
      }

      const roleId = req.user?.type || req.roleId;
      if (!roleId) {
        return next();
      }

      const role = await Role.findByPk(roleId);
      if (role && !hasActionPermission(role, modName, subModName, act)) {
        throw new ApiError(
          403,
          `Access Forbidden: You do not have '${act}' permission on '${modName}${subModName ? "." + subModName : ""}'`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Parses role permissions safely from an object or JSON string.
 */
export const parseRolePermissions = (role) => {
  let permissions = role?.permission;
  if (typeof permissions === "string") {
    try {
      permissions = JSON.parse(permissions);
    } catch (e) {
      permissions = {};
    }
  }
  return permissions || {};
};

/**
 * Gets permission object for a specific module and optional sub-module.
 */
export const getModulePermissions = (role, moduleName, subModuleName) => {
  const permissions = parseRolePermissions(role);

  // 1. Direct parent.submodule match: e.g. permissions.location.state or permissions.employee.allEmployee
  if (subModuleName && permissions[moduleName] && permissions[moduleName][subModuleName]) {
    return permissions[moduleName][subModuleName];
  }

  // 2. If subModuleName is passed, check root level or search nested parent objects
  if (subModuleName) {
    const lowerSub = subModuleName.toLowerCase();
    if (permissions[subModuleName]) return permissions[subModuleName];
    if (permissions[lowerSub]) return permissions[lowerSub];

    for (const key of Object.keys(permissions)) {
      if (permissions[key] && typeof permissions[key] === "object") {
        if (permissions[key][subModuleName]) return permissions[key][subModuleName];
        if (permissions[key][lowerSub]) return permissions[key][lowerSub];
      }
    }
  }

  // 3. If moduleName is passed, check root level or search nested parent objects
  if (moduleName) {
    const lowerMod = moduleName.toLowerCase();
    if (permissions[moduleName]) return permissions[moduleName];
    if (permissions[lowerMod]) return permissions[lowerMod];

    for (const key of Object.keys(permissions)) {
      if (permissions[key] && typeof permissions[key] === "object") {
        if (permissions[key][moduleName]) return permissions[key][moduleName];
        if (permissions[key][lowerMod]) return permissions[key][lowerMod];
      }
    }

    if (lowerMod === "office" || lowerMod === "branch") {
      if (permissions.location?.branch) return permissions.location.branch;
      if (permissions.branch) return permissions.branch;
    }
  }

  return {};
};

/**
 * 1. GET / VIEW Permission Condition Builder
 * Returns Sequelize filter condition for view access (allView / ownView)
 */
export const buildViewPermissionCondition = (
  role,
  moduleName,
  subModuleName,
  userId,
  ownFields = ["createdBy", "assigneeToEmployeeId"]
) => {
  if (role && (role.slug === "admin" || role.name?.toLowerCase() === "admin")) {
    return null; // Admin sees all items
  }

  const perms = getModulePermissions(role, moduleName, subModuleName);

  const hasAllView = Boolean(perms?.allView);
  const hasOwnView = Boolean(perms?.ownView);

  if (hasAllView) {
    return null; // All items allowed
  }

  if (hasOwnView && userId) {
    if (ownFields.length === 1) {
      return { [ownFields[0]]: userId };
    }
    return {
      [Op.or]: ownFields.map((field) => ({ [field]: userId })),
    };
  }

  // Neither allView nor ownView is granted
  return { id: null };
};

/**
 * 2. Action Permission Checker (add, update/edit, delete, get/view)
 */
export const hasActionPermission = (role, moduleName, subModuleName, action) => {
  if (role && (role.slug === "admin" || role.name?.toLowerCase() === "admin")) {
    return true; // Admin bypasses permission restrictions
  }

  const perms = getModulePermissions(role, moduleName, subModuleName);

  let act = action.toLowerCase();
  if (act === "create") act = "add";
  if (act === "update") act = "edit";

  if (act === "get" || act === "view") {
    return Boolean(perms?.allView || perms?.ownView);
  }

  return Boolean(perms?.[act]);
};

/**
 * Helper: Check ADD Permission
 */
export const canAdd = (role, moduleName, subModuleName) =>
  hasActionPermission(role, moduleName, subModuleName, "add");

/**
 * Helper: Check UPDATE / EDIT Permission
 */
export const canUpdate = (role, moduleName, subModuleName) =>
  hasActionPermission(role, moduleName, subModuleName, "edit");

/**
 * Helper: Check DELETE Permission
 */
export const canDelete = (role, moduleName, subModuleName) =>
  hasActionPermission(role, moduleName, subModuleName, "delete");

/**
 * Helper: Check GET / VIEW Permission
 */
export const canGet = (role, moduleName, subModuleName) =>
  hasActionPermission(role, moduleName, subModuleName, "get");

