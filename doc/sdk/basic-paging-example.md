This sample executes a `McAfee Active Response` search for the running processes
on a particular endpoint as specified by its IP address.

The names of the processes are received in pages and displayed.

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Active Response (MAR) Service is available on the DXL fabric.
* The JavaScript client has been authorized to perform MAR searches (see
  [Authorize Client To Perform MAR Search](https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html)
  in the OpenDXL Python SDK Documentation).

### Setup

Update the following line in the sample:

```js
var HOST_IP = '<SPECIFY_IP_ADDRESS>'

```

To specify the IP address of a host to retrieve the process list from. For
example:

```js
var HOST_IP = '192.168.1.1'
```

### Running

To run this sample execute the `sample/basic/basic-paging-example.js` script
as follows:

```sh
$ node sample/basic/basic-paging-example.js
```

The output should appear similar to the following:

```
Page: 1
    MARService.exe
    OneDrive.exe
    RuntimeBroker.exe
    SearchIndexer.exe
    SearchUI.exe
Page: 2
    ShellExperienceHost.exe
    SkypeHost.exe
    System
    UpdaterUI.exe
    VGAuthService.exe
Page: 3
    WUDFHost.exe
    WmiApSrv.exe
    WmiPrvSE.exe
    WmiPrvSE.exe
    [System Process]
...
```

### Details

The majority of the sample code is shown below:

```js
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
  marClient.search(
    [processesProjection],
    conditions,
    function (searchError, resultContext) {
      if (resultContext && resultContext.hasResults) {
        // Iterate the results of the search in pages
        var displayPageResults = function (pageNumber) {
          // Retrieve the next page of results (sort by process name, ascending)
          resultContext.getResults(
            function (resultError, searchResult) {
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
                // If the current page is not last page, invoke the display
                // results function to display the next page of results.
                if (((pageNumber * PAGE_SIZE) +
                    PAGE_SIZE) < resultContext.resultCount) {
                  displayPageResults(pageNumber + 1)
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
            },
            {
              offset: pageNumber * PAGE_SIZE,
              limit: PAGE_SIZE,
              sortBy: 'Processes|name',
              sortDirection: SortConstants.ASC
            }
          )
        }
        // Display results for the first page
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
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link MarClient}
instance is created. The MarClient instance will be used to perform searches.

Next, a search to collect process information from a particular system (as
specified by its IP address) is performed by invoking the
[search()]{@link MarClient#search} method of the {@link MarClient} instance.

Once the search has completed, the processes that were found on the system are
displayed in pages sorted by process name in ascending order. The
[getResults()]{@link ResultsContext#getResults} method of the
{@link ResultsContext} object is invoked for each page that is displayed.

It is also worth noting that in this particular sample `constants` are used for
the key names when describing the search `projections` and `conditions`.
`Constants` are also used when processing the results of the search. While the
use of `constants` is completely optional, it avoids hard-coding strings that
could be mistyped and is especially useful within integrated development
environments (IDEs) that perform auto-completion.
