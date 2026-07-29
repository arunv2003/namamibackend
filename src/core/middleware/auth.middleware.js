import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api.Errors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { employeeSchema as Employee } from "../../modules/employees/models/employee.model.js";
import { RoleSchema as Role } from "../../modules/roles/models/role.model.js";


export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, "Unauthorized request: Authentication token is missing");
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new ApiError(500, "Security Error: JWT secret is not configured on the server");
    }

    // 2. Verify Token
    const decodedToken = jwt.verify(token, secret);

    if (!decodedToken || !decodedToken.id) {
      throw new ApiError(401, "Unauthorized request: Invalid token payload");
    }

    // 3. Retrieve User from Database excluding sensitive fields
    const employee = await Employee.findByPk(decodedToken.id, {
      attributes: { exclude: ["password"] },
    });

    if (!employee) {
      throw new ApiError(401, "Unauthorized request: User no longer exists");
    }

    // 4. Security Check: Verify account status
    if (employee.status !== "active") {
      throw new ApiError(403, "Access Denied: Your account is inactive or suspended");
    }

    // 5. Fetch associated Role from Roles table using employee.type
    let role = null;
    if (employee.type) {
      role = await Role.findByPk(employee.type);
    }

    // Attach employee user, role_id, role name, role slug, and permissions to request object
    req.user = employee;
    req.userId = employee.id;
    req.roleId = employee.type;
    req.role = role ? role.name : null;
    req.roleSlug = role ? role.slug : null;
    req.permissions = role ? role.permission : null;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Unauthorized: Access token has expired. Please log in again");
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Unauthorized: Invalid or corrupted access token");
    }
    throw new ApiError(401, error.message || "Authentication failed");
  }
});


export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required prior to admin check");
  }

  let roleSlug = req.roleSlug;

  if (!roleSlug && req.user.type) {
    const role = await Role.findByPk(req.user.type);
    roleSlug = role ? role.slug : null;
    req.roleSlug = roleSlug;
  }

  if (!roleSlug || roleSlug.toLowerCase() !== "admin") {
    throw new ApiError(
      403,
      `Access Forbidden: Only users with role slug 'admin' are allowed to perform this action`
    );
  }

  next();
});



export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required prior to role authorization"));
    }

    const userRoleSlug = req.roleSlug ? req.roleSlug.toLowerCase() : "";
    const userRoleName = req.role ? req.role.toLowerCase() : "";
    const userRoleId = String(req.roleId || "");

    const isAllowed = allowedRoles.some((allowed) => {
      const target = String(allowed).toLowerCase();
      return target === userRoleSlug || target === userRoleName || target === userRoleId;
    });

    if (!isAllowed) {
      return next(
        new ApiError(
          403,
          `Access Forbidden: Role '${req.roleSlug || req.role || req.roleId}' does not have permission to perform this action`
        )
      );
    }

    next();
  };
};

export const authorizePermission = (moduleName, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required prior to permission authorization"));
    }

    // Admin role bypasses granular permission checks
    if (req.roleSlug && req.roleSlug.toLowerCase() === "admin") {
      return next();
    }

    let permissions = req.permissions;
    if (!permissions && req.roleId) {
      const role = await Role.findByPk(req.roleId);
      permissions = role ? role.permission : null;
      req.permissions = permissions;
    }

    const modulePerms = permissions ? permissions[moduleName] : null;
    const hasPermission = modulePerms && (modulePerms[action] === true || modulePerms[action] === 1);

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          `Access Forbidden: You do not have '${action}' permission on '${moduleName}' module`
        )
      );
    }

    next();
  };
};
