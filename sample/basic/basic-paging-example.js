'use strict'

// This sample demonstrates how to register a DXL service to receive Request
// messages and send Response messages back to an invoking client.

var common = require('../common')
var dxl = require('@opendxl/dxl-client')
var mar = common.requireMarClient()
var ConditionConstants = mar.ConditionConstants
var MarClient = mar.MarClient
var OperatorConstants = mar.OperatorConstants
var ProjectionConstants = mar.ProjectionConstants
var ResultConstants = mar.ResultConstants
var SortConstants = mar.SortConstants

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

var PAGE_SIZE = 5
var HOST_IP = '<SPECIFY_IP_ADDRESS>'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  var marClient = new MarClient(client)

  var processesProjection = {}
  processesProjection[ProjectionConstants.NAME] = 'Processes'

  var ipAddressCondition = {}
  ipAddressCondition[ConditionConstants.COND_NAME] = 'HostInfo'
  ipAddressCondition[ConditionConstants.COND_OUTPUT] = 'ip_address'
  ipAddressCondition[ConditionConstants.COND_OP] = OperatorConstants.EQUALS
  ipAddressCondition[ConditionConstants.COND_VALUE] = HOST_IP

  var andCondition = {}
  andCondition[ConditionConstants.AND] = [ipAddressCondition]

  var conditions = {}
  conditions[ConditionConstants.OR] = [andCondition]

  marClient.search(
    [processesProjection],
    conditions,
    function (searchError, resultContext) {
      if (resultContext && resultContext.hasResults) {
        var displayPageResults = function (pageNumber) {
          resultContext.getResults(
            function (resultError, searchResult) {
              if (searchResult) {
                console.log('Page: ' + (pageNumber + 1))
                var items = searchResult[ResultConstants.ITEMS]
                if (items) {
                  items.forEach(function (item) {
                    console.log('    ' +
                      item[ResultConstants.ITEM_OUTPUT]['Processes|name'])
                  })
                }
                if (((pageNumber * PAGE_SIZE) +
                    PAGE_SIZE) < resultContext.resultCount) {
                  displayPageResults(pageNumber + 1)
                } else {
                  client.destroy()
                }
              } else {
                client.destroy()
                if (resultError) {
                  console.log(resultError.message)
                }
              }
            },
            {
              offset: pageNumber * PAGE_SIZE,
              limit: PAGE_SIZE,
              sortBy: 'Processes|name',
              sortDirection: SortConstants.ASC
            }
          )
        }
        displayPageResults(0)
      } else {
        client.destroy()
        if (searchError) {
          console.log(searchError.message)
        }
      }
    }
  )
})
