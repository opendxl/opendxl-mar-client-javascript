/**
 * @module ResultConstants
 * @description Constants that are used access the information contained in the
 * results of a search.
 *
 * The following code:
 *
 * ```js
 * var PAGE_SIZE = 10
 * var pageNumber = 1
 * resultContext.getResults(
 *   function (resultError, searchResult) {
 *     if (resultError) {
 *       // Handle error
 *     } else {
 *       console.log('Total items: ' + searchResult['totalItems'])
 *       searchResult.items.forEach(function (item) {
 *         console.log('    ' + item.output['HostInfo|ip_address'])
 *       })
 *     }
 *   },
 *   pageNumber * PAGE_SIZE,
 *   PAGE_SIZE)
 * ```
 *
 * Can be rewritten to use `ResultConstants` as follows:
 *
 * ```js
 * var PAGE_SIZE = 10
 * var pageNumber = 1
 * resultContext.getResults(
 *   function (resultError, searchResult) {
 *     if (resultError) {
 *       // Handle error
 *     } else {
 *       console.log('Total items: ' + searchResult[ResultConstants.TOTAL_ITEMS])
 *       searchResult[ResultConstants.ITEMS].forEach(function (item) {
 *         console.log('    ' + item[ResultConstants.ITEM_OUTPUT]['HostInfo|ip_address'])
 *       })
 *     }
 *   },
 *   pageNumber * PAGE_SIZE,
 *   PAGE_SIZE)
 * ```
 */

'use strict'

module.exports = {
  /**
   * 'Current item count' result key.
   */
  CURRENT_ITEM_COUNT: 'currentItemCount',
  /**
   * 'Total items' result key.
   */
  TOTAL_ITEMS: 'totalItems',
  /**
   * 'Start index' result key.
   */
  START_INDEX: 'startIndex',
  /**
   * 'Items per page' result key.
   */
  ITEMS_PER_PAGE: 'itemsPerPage',
  /**
   * 'Items' result key.
   */
  ITEMS: 'items',
  /**
   * 'Item count' result key.
   */
  ITEM_COUNT: 'count',
  /**
   * 'Item created at' result key.
   */
  ITEM_CREATED_AT: 'created_at',
  /**
   * 'Item id' result key.
   */
  ITEM_ID: 'id',
  /**
   * 'Item output' result key.
   */
  ITEM_OUTPUT: 'output'
}
