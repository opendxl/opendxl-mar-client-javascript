'use strict'

 // This sample demonstrates how to register a DXL service to receive Request
 // messages and send Response messages back to an invoking client.

var common = require('../common')
var dxl = common.require('@opendxl/dxl-client')
var mar = common.require('@opendxl/dxl-mar-client')
var MarClient = mar.MarClient
var ProjectionConstants = mar.ProjectionConstants

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Active Response (MAR) client
  var marClient = new MarClient(client)

  // Specify that MAR should include 'HostInfo|ip_address' in the search
  // results
  var hostInfoProjection = {}
  hostInfoProjection[ProjectionConstants.NAME] = 'HostInfo'
  hostInfoProjection[ProjectionConstants.OUTPUTS] = ['ip_address']

  // Perform the search
  marClient.search([hostInfoProjection], null, processSearchResult)

  // Process the search result
  function processSearchResult (searchError, resultContext) {
    if (resultContext && resultContext.hasResults) {
      // Get up to the first 10 items from the search result
      resultContext.getResults(processResultSet, {limit: 10})
    } else {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (searchError) {
        console.log(searchError.message)
      }
    }
  }

  // Process the set of result items retrieved from the search
  function processResultSet (resultError, searchResult) {
    // Destroy the client - frees up resources so that the application
    // stops running
    client.destroy()
    if (resultError) {
      console.log(resultError.message)
    } else {
      // Loop and display the results
      var items = searchResult.items
      if (items) {
        console.log('Results:')
        items.forEach(function (item) {
          console.log('    ' + item.output['HostInfo|ip_address'])
        })
      }
    }
  }
})
