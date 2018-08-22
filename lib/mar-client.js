'use strict'

var inherits = require('inherits')
var dxl = require('@opendxl/dxl-client')
var Request = dxl.Request
var bootstrap = require('@opendxl/dxl-bootstrap')
var Client = bootstrap.Client
var MessageUtils = bootstrap.MessageUtils
var ResultsContext = require('./results-context')

// The McAfee Active Response (MAR) search topic
var MAR_SEARCH_TOPIC = '/mcafee/mar/service/api/search'

// The default amount of time (in seconds) to wait before polling the MAR server
// for results
var DEFAULT_POLL_INTERVAL = 5

// The minimum amount of time (in seconds) to wait before polling the MAR server
// for results
var MIN_POLL_INTERVAL = 5

/**
 * @classdesc Responsible for all communication with the
 * Data Exchange Layer (DXL) fabric.
 * @external DxlClient
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html}
 */

/**
 * @classdesc This client provides a high level wrapper for communicating with
 * the McAfee Active Response (MAR) DXL service.
 *
 * The purpose of this client is to allow the user to perform MAR searches
 * without having to focus on lower-level details such as MAR-specific DXL
 * topics and message formats.
 * @param {external:DxlClient} dxlClient - The DXL client to use for
 *   communication with the MAR DXL service.
 * @constructor
 */
function MarClient (dxlClient) {
  Client.call(this, dxlClient)
  this._pollInterval = DEFAULT_POLL_INTERVAL

  /**
   * Executes a query against the MAR search API.
   *
   * @param {Object} payload - The payload.
   * @param {Function} callback - Callback function to invoke with the results
   *   of the search. If an error occurs when performing the lookup, the first
   *   parameter supplied to the callback contains an `Error` object with
   *   failure details. On successful completion of the search, the results of
   *   the query is provided as the second parameter to the callback.
   * @private
   */
  this._invokeMarSearchApi = function (payload, callback) {
    var request = new Request(MAR_SEARCH_TOPIC)
    MessageUtils.objectToJsonPayload(request, payload)
    this._dxlClient.asyncRequest(request, function (error, response) {
      if (error) {
        callback(new Error('Error: ' + error.message), response)
      } else {
        var responseObj = MessageUtils.jsonPayloadToObject(response)
        var code = responseObj.code
        if (!code) {
          callback(new Error('Error: unable to find response code'))
        } else if (code >= 200 && code <= 299) {
          callback(null, responseObj)
        } else if (responseObj.body && responseObj.body.applicationErrorList &&
          (responseObj.body.applicationErrorList.length > 0)) {
          var applicationError = responseObj.body.applicationErrorList[0]
          callback(new Error(applicationError.message + ': ' +
            applicationError.code))
        } else if (responseObj.body) {
          callback(new Error(responseObj.body + ': ' + code))
        } else {
          callback(new Error('Error: Received failure response code: ' +
            code))
        }
      }
    })
  }
}

inherits(MarClient, Client)

/**
 * @property {Number} - The amount of time to wait (in seconds) before
 *   polling the MAR server for results. Defaults to `5`. If a value less than
 *   `5` is specified, a `RangeError` is thrown.
 * @name MarClient#pollInterval
 */
Object.defineProperty(MarClient.prototype, 'pollInterval', {
  get: function () {
    return this._pollInterval
  },
  set: function (value) {
    if (value < MIN_POLL_INTERVAL) {
      throw RangeError('Poll interval must be greater than or equal to ' +
        MIN_POLL_INTERVAL)
    }
    this._pollInterval = value
  }
})

/**
 * Executes a search via McAfee Active Response.
 *
 * Once the search has completed a {@link ResultsContext} object is returned
 * which is used to access the search results.
 *
 * **Client Authorization**
 *
 * The OpenDXL JavaScript client invoking this method must have permission
 * to send messages to the `/mcafee/mar/service/api/search` topic.
 *
 * See the following page for details on authorizing a client to
 * perform MAR searches:
 *
 * <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>
 *
 * Execution of a MAR search requires an array of `projections` and an
 * optional object containing the search `conditions`.
 *
 * **Projections**
 *
 * `Projections` are used to describe the information to collect in the search.
 * Each `projection` consists of a `collector` name and a list of `output names`
 * from the `collector`. For example, the `Processes` collector includes
 * `output names` such as `name`, `sha1`, `md5`, etc.
 *
 * For a complete list of `collectors` and their associated `output names` refer
 * to the `McAfee Active Response Product Guide`.
 *
 * Each `projection` specified must contain the following fields:
 *
 * * `name`: The name of the `collector` to project
 * * `outputs`: An array of `output names` of the `collector` to project
 *
 * The JavaScript array below is equivalent to the `projections` within the
 * following textual search:
 *
 * `Processes name, id where Processes name equals "csrss" and Processes name
 * contains "exe" or Processes size not greater than 200`
 *
 * ```js
 * [{
 *   name: "Processes",
 *   outputs: ["name", "id"]
 * }]
 * ```
 *
 * **Conditions**
 *
 * `Conditions` are used to restrict which items are included in the search
 * results. For example, a search that collects process-related information
 * could be limited to those processes which match a specified name.
 *
 * A condition has a fixed structure starting with an ``or``
 * conditional operator and allowing only one level of ``and``
 * conditions.
 *
 * The JavaScript object below is equivalent to the `conditions` within the
 * following textual search:
 *
 * `Processes name, id where Processes name equals "csrss" and
 * Processes name contains "exe" or Processes size not greater than
 * 200`
 *
 * ```js
 * {
 *   or: [{
 *     and: [{
 *       name: 'Processes',
 *       output: 'name',
 *       op: 'EQUALS',
 *       value: 'csrss'
 *     },
 *     {
 *       name: 'Processes',
 *       output: 'name',
 *       op: 'CONTAINS',
 *       value: 'exe'
 *     }]
 *   },
 *   {
 *     and: [{
 *       name: 'Processes',
 *       output: 'size',
 *       op: 'GREATER_THAN',
 *       value: '200',
 *       negated: 'true'
 *     }]
 *   }]
 * }
 * ```
 *
 * The following fields are used for each `condition`:
 *
 * * `name`: The name of the `collector` from which to retrieve a value for
 *   comparison
 * * `output`: The `output name` from the `collector` that selects the specific
 *   value to use for comparison
 * * `op`: The comparison operator
 * * `value`: The value to compare with the value from the collector
 * * `negated`: (optional) Indicates if the comparison is negated
 *
 * The operators available for each value data type are as follows:
 *
 * | Operator           | NUMBER | STRING | BOOLEAN | DATE | IPV4IPV6 | REG_STR  |
 * | ------------------ | :----: | :----: | :-----: | :--: | :------: | :------: |
 * | GREATER_EQUAL_THAN |    x   |        |         |      |          |          |
 * | GREATER_THAN       |    x   |        |         |      |          |          |
 * | LESS_EQUAL_THAN    |    x   |        |         |      |          |          |
 * | LESS_THAN          |    x   |        |         |      |          |          |
 * | EQUALS             |    x   |   x    |    x    |   x  |     x    |  x `(*)` |
 * | CONTAINS           |        |   x    |         |      |     x    |  x `(*)` |
 * | STARTS_WITH        |        |   x    |         |      |          |  x `(*)` |
 * | ENDS_WITH          |        |   x    |         |      |          |  x `(*)` |
 * | BEFORE             |        |        |         |   x  |          |          |
 * | AFTER              |        |        |         |   x  |          |          ||
 *
 * `(*)` Negated field is not supported in those cases.
 *
 * @example
 * // Create the client
 * var client = new dxl.Client(config)
 *
 * // Connect to the fabric, supplying a callback function which is invoked
 * // when the connection has been established
 * client.connect(function () {
 *   var marClient = new MarClient(client)
 *
 *   marClient.search(
 *     [{
 *       name: 'Processes',
 *       outputs: ['name', 'id']
 *     }],
 *     {
 *       or: [{
 *         and: [{
 *           name: 'Processes',
 *           output: 'name',
 *           op: 'EQUALS',
 *           value: 'csrss'
 *         },
 *         {
 *           name: 'Processes',
 *           output: 'name',
 *           op: 'CONTAINS',
 *           value: 'exe'
 *         }]
 *       },
 *       {
 *         and: [{
 *           name: 'Processes',
 *           output: 'size',
 *           op: 'GREATER_THAN',
 *           value: '200',
 *           negated: 'true'
 *         }]
 *       }]
 *     },
 *     function (searchError, resultContext) {
 *       if (resultContext && resultContext.hasResults) {
 *         // Process results
 *       } else {
 *         // Handle searchError
 *       }
 *     }
 *   )
 * })
 * @param {Array<Object>} projections - An object containing the `projections`
 *   for the search.
 * @param {Object} conditions - An object containing the `conditions` for the
 *   search.
 * @param {Function} callback - Callback function to invoke with the results
 *   of the search. If an error occurs when performing the lookup, the first
 *   parameter supplied to the callback contains an `Error` object with
 *   failure details. On successful completion of the search, a
 *   {@link ResultsContext} object is provided as the second parameter to the
 *   callback.
 */
MarClient.prototype.search = function (projections, conditions, callback) {
  var that = this
  var createRequest = {
    target: '/v1/simple',
    method: 'POST',
    parameters: {},
    body: {projections: projections}
  }

  if (conditions) {
    createRequest.body.condition = conditions
  }

  // Create the search
  this._invokeMarSearchApi(createRequest,
    function (createError, createResponse) {
      if (createError) {
        callback(createError, createResponse)
      } else {
        if (createResponse.body && createResponse.body.id) {
          // Get the search identifier
          var searchId = createResponse.body.id

          // Start the search
          that._invokeMarSearchApi({
            target: '/v1/' + searchId + '/start',
            method: 'PUT',
            parameters: {},
            body: {}
          }, function (startError, startResponse) {
            if (startError) {
              callback(startError, startResponse)
            } else {
              var statusRequest = {
                target: '/v1/' + searchId + '/status',
                method: 'GET',
                parameters: {},
                body: {}
              }

              // Poll for status until the search has finished
              var checkStatus = function () {
                that._invokeMarSearchApi(statusRequest,
                  function (statusError, statusResponse) {
                    if (statusError) {
                      callback(statusError, statusResponse)
                    } else {
                      var body = statusResponse.body
                      // If the status is 'FINISHED', invoke the result
                      // callback. If not, wait for the configured poll interval
                      // and check status again.
                      if (body && body.status === 'FINISHED') {
                        // Deliver the results information to the callback
                        callback(null, new ResultsContext(that, searchId,
                          body.results, body.errors, body.hosts,
                          body.subscribedHosts
                        ))
                      } else {
                        setTimeout(checkStatus, that._pollInterval * 1000)
                      }
                    }
                  })
              }
              checkStatus()
            }
          })
        } else {
          callback(new Error('Error: Did not find id in create search response'))
        }
      }
    }
  )
}

module.exports = MarClient
