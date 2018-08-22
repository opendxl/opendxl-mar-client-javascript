/**
 * @module ProjectionConstants
 * @description Constants that are used to describe a `projection`.
 *
 * The following statement:
 *
 * ```js
 * [{
 *   name: 'HostInfo',
 *   outputs: ['ip_address']
 * }]
 * ```
 *
 * Can be rewritten to use `ProjectionConstants` as follows:
 *
 * ```js
 * var hostIpProjection = {}
 * hostIpProjection[ProjectionConstants.NAME] = 'HostInfo'
 * hostIpProjection[ProjectionConstants.OUTPUTS] = ['ip_address']
 *
 * var projections = [hostIpProjection]
 * ```
 */

'use strict'

module.exports = {
  /**
   * Projection name
   */
  NAME: 'name',
  /**
   * Projection outputs
   */
  OUTPUTS: 'outputs'
}
