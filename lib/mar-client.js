'use strict'

var inherits = require('inherits')
var dxl = require('@opendxl/dxl-client')
var Request = dxl.Request
var bootstrap = require('@opendxl/dxl-bootstrap')
var Client = bootstrap.Client
var MessageUtils = bootstrap.MessageUtils
var ResultsContext = require('./results-context')

var MAR_SEARCH_TOPIC = '/mcafee/mar/service/api/search'
var DEFAULT_POLL_INTERVAL = 5

function MarClient (dxlClient) {
  Client.call(this, dxlClient)
  this.pollInterval = DEFAULT_POLL_INTERVAL

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

  this._invokeMarSearchApi(createRequest,
    function (createError, createResponse) {
      if (createError) {
        callback(createError, createResponse)
      } else {
        if (createResponse.body && createResponse.body.id) {
          var searchId = createResponse.body.id
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
              var checkStatus = function () {
                that._invokeMarSearchApi(statusRequest,
                  function (statusError, statusResponse) {
                    if (statusError) {
                      callback(statusError, statusResponse)
                    } else {
                      var body = statusResponse.body
                      if (body && body.status === 'FINISHED') {
                        callback(null, new ResultsContext(that, searchId,
                          body.results, body.errors, body.hosts,
                          body.subscribedHosts
                        ))
                      } else {
                        setTimeout(checkStatus, that.pollInterval * 1000)
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
