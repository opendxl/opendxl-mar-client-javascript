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
 * var ipAddressCondition = {}
 * ipAddressCondition[ConditionConstants.COND_NAME] = 'HostInfo'
 * ipAddressCondition[ConditionConstants.COND_OUTPUT] = 'ip_address'
 * ipAddressCondition[ConditionConstants.COND_OP] = 'EQUALS'
 * ipAddressCondition[ConditionConstants.COND_NAME] = '192.168.1.1'
 *
 * var firstOrCondition = {}
 * firstOrCondition[ConditionConstants.AND] = [ipAddressCondition]
 *
 * var orConditions = [firstOrCondition]
 *
 * var conditions = {}
 * conditions[ConditionConstants.OR] = orConditions
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
