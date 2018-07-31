'use strict'

var ResultConstants = require('./constants/result-constants')
var SortConstants = require('./constants/sort-constants')

/**
 * @classdesc This object is used to access to the results of a MAR search.
 * @see MarClient#search
 * @param {MarClient} marClient - The MAR client used to perform the search.
 * @param {String} searchId - The identifier assigned to the search.
 * @param {Number} resultCount - The total count of items available in the
 *   search results.
 * @param {Number} errorCount - The count of errors that were reported during
 *   the search.
 * @param {Number} hostCount - The count of endpoints that responded to the
 *   search.
 * @param {Number} subscribedHostCount - The count of endpoints that were
 *   connected to the DXL fabric when the search started.
 * @constructor
 */
function ResultsContext (marClient, searchId, resultCount, errorCount,
                         hostCount, subscribedHostCount) {
  /**
   * The MAR client used to perform the search.
   * @type {MarClient}
   * @private
   */
  this._marClient = marClient
  /**
   * The identifier assigned to the search.
   * @type {String}
   */
  this.searchId = searchId
  /**
   * The total count of items available in the search results.
   * @type {Number}
   */
  this.resultCount = resultCount
  /**
   * The count of errors that were reported during the search.
   * @type {Number}
   */
  this.errorCount = errorCount
  /**
   * The count of endpoints that responded to the search.
   * @type {Number}
   */
  this.hostCount = hostCount
  /**
   * The count of endpoints that were connected to the DXL fabric when the
   * search started.
   * @type {Number}
   */
  this.subscribedHostCount = subscribedHostCount
}

module.exports = ResultsContext

/**
 * @property {Boolean} - Whether the search has results.
 * @name ResultConstants#hasResults
 */
Object.defineProperty(ResultsContext.prototype, 'hasResults', {
  get: function () {
    return this.resultCount > 0
  }
})

/**
 * This method is used to retrieve a particular set of results from a
 * MAR search.
 *
 * **Results**
 *
 * Each search result item has the following fields:
 *
 * * `id`: The identifier of the item within the search results
 * * `count`: The number of times that the search result was reported
 * * `created_at`: The item timestamp
 * * `output`: The search result data where each key is composed of
 *   `<CollectorName>|<OutputName>` and the value that corresponds to
 *   that `collector` and `output name`.
 *
 * The object below is an example of a result that would be returned from the
 * following textual search:
 *
 * `Processes name, id where Processes name equals "csrss" and Processes name
 * contains "exe" or Processes size not greater than 200`
 *
 * ```js
 * {
 *   'startIndex': 0,
 *   'totalItems': 2,
 *   'currentItemCount': 2,
 *   'itemsPerPage': 20,
 *   'items': [
 *     {
 *       'id': '{1=[[System Process], 0]}',
 *       'count': 2,
 *       'created_at': '2016-11-16T22:50:04.650Z',
 *       'output': {
 *         'Processes|id': 0,
 *         'Processes|name': '[System Process]'
 *       }
 *     },
 *     {
 *       'id": '{1=[System, 4]}',
 *       'count': 1,
 *       'created_at': '2016-11-16T22:50:04.650Z',
 *       'output': {
 *         'Processes|id': 4,
 *         'Processes|name': 'System'
 *       }
 *     }
 *   ]
 * }
 * ```
 * @example
 * var PAGE_SIZE = 5
 * var pageNumber = 1
 * resultContext.getResults(
 *   function (resultError, searchResult) {
 *     if (resultError) {
 *       // Handle error
 *     } else {
 *       searchResult.items.forEach(function (item) {
 *         console.log('    ' + item.output['Processes|name'])
 *       })
 *     }
 *   },
 *   pageNumber * PAGE_SIZE,
 *   PAGE_SIZE,
 *   null,
 *   'Processes|name',
 *   'asc')
 * @param {Function} callback - Callback function to invoke with a set of
 *   results from the search. If an error occurs when performing the lookup, the
 *   first parameter supplied to the callback contains an `Error` object with
 *   failure details. On successful completion of the search, the set of
 *   results, as an object, is provided as the second parameter to the callback.
 * @param {Number} [offset=0] - Index of the first result item to be returned.
 *   This value is ``0`` based.
 * @param {Number} [limit=0] - The maximum number of items to return in the
 *   results.
 * @param {String} [textFilter] - A text based filter to limit the results
 * @param {String} [sortBy=count] - The field that will be used to sort the
 *   results.
 * @param {String} [sortDirection=desc] - values: ascending `asc` or descending
 *   `desc` (String).
 */
ResultsContext.prototype.getResults = function (callback, offset, limit,
                                                textFilter, sortBy,
                                                sortDirection) {
  offset = offset || 0
  limit = limit || 20
  textFilter = textFilter || ''
  sortBy = sortBy || ResultConstants.ITEM_COUNT
  sortDirection = sortDirection || SortConstants.DESC

  this._marClient._invokeMarSearchApi({
    target: '/v1/' + this.searchId + '/results',
    method: 'GET',
    parameters: {
      '$offset': offset,
      '$limit': limit,
      filter: textFilter,
      sortBy: sortBy,
      sortDirection: sortDirection
    },
    body: {}
  }, function (error, response) {
    if (error) {
      callback(error, response)
    } else {
      var body = response.body
      if (body) {
        callback(null, body)
      } else {
        callback(new Error("Unable to find 'body' in search result"))
      }
    }
  })
}
