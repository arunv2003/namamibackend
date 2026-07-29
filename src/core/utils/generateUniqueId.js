/**
 * Utility function to generate a unique ID based on a prefix sent by user/service and random digits.
 * Example usage:
 *   generateUniqueId("TSK")    => "TSK58291"
 *   generateUniqueId("EMP")    => "EMP19482"
 *   generateUniqueId("CUST")   => "CUST48102"
 *   generateUniqueId("TSK", 5) => "TSK12345"
 *
 * @param {string} prefix - The prefix passed from service/model (e.g. "TSK", "EMP", "CUST")
 * @param {number} digitCount - Number of random digits to generate (default: 5)
 * @returns {string} Unique ID string
 */
export const generateUniqueId = (prefix = "ID", digitCount = 5) => {
  if (!prefix || typeof prefix !== "string") {
    prefix = "ID";
  }

  const cleanPrefix = prefix.trim().toUpperCase();

  // Generate random N-digit number
  const count = Math.max(1, parseInt(digitCount, 10) || 5);
  const min = Math.pow(10, count - 1);
  const max = Math.pow(10, count) - 1;
  const randomDigits = Math.floor(min + Math.random() * (max - min + 1));

  return `${cleanPrefix}${randomDigits}`;
};

export default generateUniqueId;
