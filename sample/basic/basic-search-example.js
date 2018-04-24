'use strict'

 // This sample demonstrates how to register a DXL service to receive Request
 // messages and send Response messages back to an invoking client.

var common = require('../common')
var dxl = require('@opendxl/dxl-client')
var mar = common.requireMarClient()
var MarClient = mar.MarClient
var ProjectionConstants = mar.ProjectionConstants

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  var marClient = new MarClient(client)

  var hostInfoProjection = {}
  hostInfoProjection[ProjectionConstants.NAME] = 'HostInfo'
  hostInfoProjection[ProjectionConstants.OUTPUTS] = ['ip_address']

  marClient.search([hostInfoProjection], null,
    function (searchError, resultContext) {
      if (resultContext && resultContext.hasResults) {
        resultContext.getResults(function (resultError, searchResult) {
          client.destroy()
          if (resultError) {
            console.log(resultError.message)
          } else {
            var items = searchResult.items
            if (items) {
              console.log('Results:')
              items.forEach(function (item) {
                console.log('    ' + item.output['HostInfo|ip_address'])
              })
            }
          }
        }, 0, 10)
      } else {
        client.destroy()
        if (searchError) {
          console.log(searchError.message)
        }
      }
    }
  )
})
