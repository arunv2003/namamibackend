export const generateSlug = (text, appendRandom = true) => {
  if (!text) return "";

  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  if (appendRandom) {
    const suffix = Math.random().toString(36).substring(2, 7);
    slug = `${slug}-${suffix}`;
  }

  return slug.toLowerCase();
};
