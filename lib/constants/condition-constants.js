/**
 * @module ConditionConstants
 * @description Constants that are used to describe a `condition`.
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
 * Can be rewritten to use `ConditionConstants` as follows:
 *
 * ```js
 * {
 *   ConditionConstants.OR: [{
 *     ConditionConstants.AND: [{
 *       ConditionConstants.COND_NAME: 'HostInfo',
 *       ConditionConstants.COND_OUTPUT: 'ip_address',
 *       ConditionConstants.COND_OP: 'EQUALS',
 *       ConditionConstants.COND_VALUE: '192.168.1.1'
 *     }]
 *   }]
 * }
 * ```
 */

'use strict'

module.exports = {
  /**
   * 'And' condition
   */
  AND: 'and',
  /**
   * 'Or' condition
   */
  OR: 'or',
  /**
   * Condition name
   */
  COND_NAME: 'name',
  /**
   * Condition output
   */
  COND_OUTPUT: 'output',
  /**
   * Condition operation
   */
  COND_OP: 'op',
  /**
   * Condition value
   */
  COND_VALUE: 'value'
}
