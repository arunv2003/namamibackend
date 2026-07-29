import cache from "../utils/cache.js";

/**
 * Middleware to invalidate all cache whenever a mutation (POST, PUT, PATCH, DELETE) succeeds.
 */
export const clearCacheOnMutation = (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.flushAll();
        console.log(`🧹 [CACHE FLUSHED] Invalidated cache after successful ${req.method} ${req.originalUrl || req.url}`);
      }
      return originalJson.call(this, body);
    };
  }
  next();
};

const cacheMiddleware = (ttlOrKey, customKey) => {
  let ttl;
  let keyGenerator;

  if (typeof ttlOrKey === "number") {
    ttl = ttlOrKey;
    if (typeof customKey === "function") {
      keyGenerator = customKey;
    } else if (typeof customKey === "string") {
      keyGenerator = () => customKey;
    } else {
      keyGenerator = (req) => {
        const userId = req.user?.id || req.user?.role_id || "public";
        return `cache:${req.method}:${userId}:${req.originalUrl || req.url}`;
      };
    }
  } else if (typeof ttlOrKey === "function") {
    keyGenerator = ttlOrKey;
    ttl = typeof customKey === "number" ? customKey : undefined;
  } else if (typeof ttlOrKey === "string") {
    keyGenerator = () => ttlOrKey;
    ttl = typeof customKey === "number" ? customKey : undefined;
  } else {
    keyGenerator = (req) => {
      const userId = req.user?.id || req.user?.role_id || "public";
      return `cache:${req.method}:${userId}:${req.originalUrl || req.url}`;
    };
    ttl = typeof customKey === "number" ? customKey : undefined;
  }

  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    // Set no-cache header to prevent browser HTTP caching
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    const key = keyGenerator(req);
    const cachedData = cache.get(key);

    if (cachedData) {
      console.log(`⚡ [CACHE HIT] Data served from Cache: ${key}`);
      res.setHeader("X-Cache", "HIT");
      return res.json(cachedData);
    }

    console.log(`🗄️ [CACHE MISS] Data fetched from DB: ${key}`);
    res.setHeader("X-Cache", "MISS");

    const originalJson = res.json.bind(res);

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (ttl) {
          cache.set(key, body, ttl);
        } else {
          cache.set(key, body);
        }
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

export default cacheMiddleware;