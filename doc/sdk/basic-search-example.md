This sample executes a `McAfee Active Response` search for the IP addresses of
hosts that have an Active Response client installed.

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Active Response (MAR) Service is available on the DXL fabric.
* The JavaScript client has been authorized to perform MAR searches (see
  [Authorize Client To Perform MAR Search](https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html)
  in the OpenDXL Python SDK Documentation).

### Running

To run this sample execute the `sample/basic/basic-search-example.js` script
as follows:

```sh
$ node sample/basic/basic-search-example.js
```

The output should appear similar to the following:

```
Results:
    192.168.130.152
    192.168.130.133
```

### Details

The majority of the sample code is shown below:

```js
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
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link MarClient}
instance is created. The MarClient instance will be used to perform searches.

Next, a search to collect the IP addresses for monitored systems is performed by
invoking the [search()]{@link MarClient#search} method of the {@link MarClient}
instance.

On successful execution of the search, the `resultContext` parameter provided to
the `processSearchResult` function contains the result of the search attempt, a
{@link ResultsContext} instance. The first 10 results are retrieved by invoking
the [getResults()]{@link ResultsContext#getResults} method of the
{@link ResultsContext} object.

On successful receipt of the search results, the `searchResult` parameter
provided to the `processResultSet` function contains the search results. The
results are iterated and printed to the screen.
