'use strict'

var ResultConstants = require('./constants/result-constants')
var SortConstants = require('./constants/sort-constants')

function ResultsContext (marClient, searchId, resultCount, errorCount,
                         hostCount, subscribedHostCount) {
  this._marClient = marClient
  this.searchId = searchId
  this.resultCount = resultCount
  this.errorCount = errorCount
  this.hostCount = hostCount
  this.subscribedHostCount = subscribedHostCount
}

module.exports = ResultsContext

Object.defineProperty(ResultsContext.prototype, 'hasResults', {
  get: function () {
    return this.resultCount > 0
  }
})

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
