/**
 * @module SortConstants
 * @description Constants that describe the direction the search results should
 * be sorted (ascending vs. descending).
 *
 * The following code:
 *
 * ```js
 * var PAGE_SIZE = 10
 * var pageNumber = 1
 * resultContext.getResults(
 *   function (resultError, searchResult) {
 *     // Process results
 *   },
 *   pageNumber * PAGE_SIZE,
 *   PAGE_SIZE,
 *   null,
 *   'Processes|name',
 *   'asc')
 * )
 * ```
 *
 * Can be rewritten to use `SortConstants` as follows:
 *
 * ```js
 * var PAGE_SIZE = 10
 * var pageNumber = 1
 * resultContext.getResults(
 *   function (resultError, searchResult) {
 *     // Process results
 *   },
 *   pageNumber * PAGE_SIZE,
 *   PAGE_SIZE,
 *   null,
 *   'Processes|name',
 *   SortConstants.ASC)
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
