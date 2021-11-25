/**
 * Clamp a number to a given range
 *
 * @param {number} num - the number to clamp
 * @param {number} min - the minimum value
 * @param {number} max - the maximum value
 * @returns {number}
 */
export const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num)
