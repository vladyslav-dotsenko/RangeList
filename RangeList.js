'use strict';

class RangeList {
  static _validateRangeInput(range) {
    if (!Array.isArray(range))
      throw new TypeError(`Invalid input range: expected array, got ${typeof range}`)

    const [from = 0, to = 0] = range;
    if (to < from)
      throw new TypeError(`Invalid input range, ${range}`);
  }

  /**
   * Compare ranges A and B
   * Return:
   *    1 if B > A
   *    0 if B collides A
   *   -1 if B < A
   */
  static _compareRanges(rangeA, rangeB) {
    if (rangeA[1] < rangeB[0]) return 1;
    if (rangeA[0] > rangeB[1]) return -1;
    return 0;
  }

  static _mergeRanges(rangeA, rangeB) {
    return [Math.min(rangeA[0], rangeB[0]), Math.max(rangeA[1], rangeB[1])];
  }

  static _excludeRange(range, exclusion) {
    const result = [];

    if (exclusion[0] - range[0] > 0) {
      result.push([range[0], exclusion[0]]);
    }

    if (range[1] - exclusion[1] > 0) {
      result.push([exclusion[1], range[1]]);
    }

    return result;
  }

  constructor({ logger = console } = {}) {
    this.logger = logger;
    this.ranges = [];
  }

  /**
   * Adds a range to the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  add(range = []) {
    RangeList._validateRangeInput(range);
    const updatedRanges = [];
    let rest = [];
    let candidate = range;

    for (let i = 0; i < this.ranges.length; i++) {
      const targetRange = this.ranges[i];
      const rangesRelation = RangeList._compareRanges(candidate, targetRange);
      if (rangesRelation === -1) {
        updatedRanges.push(targetRange);
        continue;
      }
      if (rangesRelation === 0) {
        candidate = RangeList._mergeRanges(candidate, targetRange);
        continue;
      }
      if (rangesRelation === 1) {
        rest = this.ranges.slice(i);
        break;
      }
    }

    updatedRanges.push(candidate);
    this.ranges = updatedRanges.concat(rest);
  }

  /**
   * Removes a range from the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  remove(range) {
    RangeList._validateRangeInput(range);
    const updatedRanges = [];
    let rest = [];
    let candidate = range;

    for (let i = 0; i < this.ranges.length; i++) {
      const targetRange = this.ranges[i];
      const rangesRelation = RangeList._compareRanges(candidate, targetRange);
      if (rangesRelation === -1) {
        updatedRanges.push(targetRange);
        continue;
      }
      if (rangesRelation === 0) {
        const exclusionChunks = RangeList._excludeRange(targetRange, candidate);
        exclusionChunks.forEach(chunk => updatedRanges.push(chunk));
        continue;
      }
      if (rangesRelation === 1) {
        rest = this.ranges.slice(i);
        break;
      }
    }

    this.ranges = updatedRanges.concat(rest);
  }

  /**
   * Prints out the list of ranges in the range list
   */
  print() {
    const textualRanges = this.ranges.map(([a, b]) => `[${a}, ${b})`);
    const message = textualRanges.join(' ');
    this.logger && this.logger.info(message);

    return message;
  }
}

module.exports = RangeList;
