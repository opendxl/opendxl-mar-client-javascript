/**
 * @module OperatorConstants
 * @description Constants that describe the `operator` to use within a
 * `condition`.
 *
 * The following statement:
 *
 * ```js
 * {
 *   or: [{
 *     and: [{
 *       name: 'HostInfo',
 *       output: 'ip_address',
 *       op: 'EQUALS',
 *       value: '192.168.1.1'
 *     }]
 *   }]
 * }
 * ```
 *
 * Can be rewritten to use `OperatorConstants` as follows:
 *
 * ```js
 * {
 *   or: [{
 *     and: [{
 *       name: 'HostInfo',
 *       output: 'ip_address',
 *       op: OperatorConstants.EQUALS,
 *       value: '192.168.1.1'
 *     }]
 *   }]
 * }
 * ```
 */

'use strict'

module.exports = {
  /**
   * 'Greater than or equal to' operator
   */
  GREATER_EQUAL_THAN: 'GREATER_EQUAL_THAN',
  /**
   * 'Greater than' operator
   */
  GREATER_THAN: 'GREATER_THAN',
  /**
   * 'Less than or equal to' operator
   */
  LESS_EQUAL_THAN: 'LESS_EQUAL_THAN',
  /**
   * 'Less than' operator
   */
  LESS_THAN: 'LESS_THAN',
  /**
   * 'Equals' operator
   */
  EQUALS: 'EQUALS',
  /**
   * 'Contains' operator
   */
  CONTAINS: 'CONTAINS',
  /**
   * 'Starts with' operator
   */
  STARTS_WITH: 'STARTS_WITH',
  /**
   * 'Ends with' operator
   */
  ENDS_WITH: 'ENDS_WITH',
  /**
   * 'Before' operator
   */
  BEFORE: 'BEFORE',
  /**
   * 'After' operator
   */
  AFTER: 'AFTER'
}
