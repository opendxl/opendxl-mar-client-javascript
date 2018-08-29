'use strict'

// This sample demonstrates how to register a DXL service to receive Request
// messages and send Response messages back to an invoking client.

var common = require('../common')
var dxl = common.require('@opendxl/dxl-client')
var mar = common.require('@opendxl/dxl-mar-client')
var ConditionConstants = mar.ConditionConstants
var MarClient = mar.MarClient
var OperatorConstants = mar.OperatorConstants
var ProjectionConstants = mar.ProjectionConstants
var ResultConstants = mar.ResultConstants
var SortConstants = mar.SortConstants

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// The size of each page
var PAGE_SIZE = 5

// The IP address of the host to retrieve the processes for
var HOST_IP = '<SPECIFY_IP_ADDRESS>'

// Create the client
var client = new dxl.Client(config)

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Active Response (MAR) client
  var marClient = new MarClient(client)

  // Specify that MAR should include 'Processes' in the search results
  var processesProjection = {}
  processesProjection[ProjectionConstants.NAME] = 'Processes'

  // Set the search conditions
  var ipAddressCondition = {}
  ipAddressCondition[ConditionConstants.COND_NAME] = 'HostInfo'
  ipAddressCondition[ConditionConstants.COND_OUTPUT] = 'ip_address'
  ipAddressCondition[ConditionConstants.COND_OP] = OperatorConstants.EQUALS
  ipAddressCondition[ConditionConstants.COND_VALUE] = HOST_IP

  var firstOrCondition = {}
  firstOrCondition[ConditionConstants.AND] = [ipAddressCondition]

  var conditions = {}
  conditions[ConditionConstants.OR] = [firstOrCondition]

  // Start the search
  marClient.search([processesProjection], conditions, processSearchResult)

  // Process the set of result items retrieved from the search
  function processSearchResult (searchError, resultContext) {
    if (resultContext && resultContext.hasResults) {
      // Iterate the results of the search in pages
      processResultPage(resultContext, 0)
    } else {
      client.destroy()
      if (searchError) {
        console.log(searchError.message)
      }
    }
  }

  // Retrieve the next page of results (sort by process name, ascending)
  function processResultPage (resultContext, pageNumber) {
    resultContext.getResults(
      function (resultError, searchResult) {
        displayResultPage(resultContext, pageNumber, resultError, searchResult)
      },
      {
        offset: pageNumber * PAGE_SIZE,
        limit: PAGE_SIZE,
        sortBy: 'Processes|name',
        sortDirection: SortConstants.ASC
      }
    )
  }

  // Display items for the current page. If the current page is not the last
  // one, retrieve the next page of results.
  function displayResultPage (resultContext, pageNumber,
                              resultError, searchResult) {
    if (searchResult) {
      // Display items in the current page
      console.log('Page: ' + (pageNumber + 1))
      var items = searchResult[ResultConstants.ITEMS]
      if (items) {
        items.forEach(function (item) {
          console.log('    ' +
            item[ResultConstants.ITEM_OUTPUT]['Processes|name'])
        })
      }
      // If the current page is not the last one, invoke the display results
      // function to display the next page of results.
      if (((pageNumber * PAGE_SIZE) + PAGE_SIZE) < resultContext.resultCount) {
        processResultPage(resultContext, pageNumber + 1)
      } else {
        // The last page of results has been displayed. Destroy the
        // client - frees up resources so that the application stops
        // running
        client.destroy()
      }
    } else {
      // No search results could be found for the current page.
      // Destroy the client - frees up resources so that the
      // application stops running.
      client.destroy()
      if (resultError) {
        console.log(resultError.message)
      }
    }
  }
})
