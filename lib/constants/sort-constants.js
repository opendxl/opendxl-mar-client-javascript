/**
 * @module SortConstants
 * @description Constants that describe the direction the search results should
 * be sorted (ascending vs. descending).
 *
 * The following code:
 *
 * ```js
 * resultContext.getResults(
 *   function (resultError, searchResult) {
 *     // Process results
 *   },
 *   {
 *     sortBy: 'Processes|name',
 *     sortDirection: 'asc'
 *   }
 * )
 * ```
 *
 * Can be rewritten to use `SortConstants` as follows:
 *
 * ```js
 * resultContext.getResults(
 *   function (resultError, searchResult) {
 *     // Process results
 *   },
 *   {
 *     sortBy: 'Processes|name',
 *     sortDirection: SortConstants.ASC
 *   }
 * )
 * ```
 */

'use strict'

module.exports = {
  /**
   * Sort ascending
   */
  ASC: 'asc',
  /**
   * Sort descending
   */
  DESC: 'desc'
}
