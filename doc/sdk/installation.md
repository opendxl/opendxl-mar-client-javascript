### Prerequisites

* OpenDXL JavaScript Client (Node.js) library installed
  * <https://github.com/opendxl/opendxl-client-javascript>

* The OpenDXL JavaScript Client (Node.js) prerequisites must be satisfied
  * <https://opendxl.github.io/opendxl-client-javascript/jsdoc/tutorial-installation.html>

* McAfee Active Response Server installed and available on DXL fabric
  * <http://www.mcafee.com/us/products/endpoint-threat-defense-response.aspx>

* OpenDXL Javascript Client has permission to perform MAR searches
  * <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>

* Node.js 4.0 or higher installed.

### Installation

Before installing the MAR DXL JavaScript client library, change to the
directory which you extracted from the SDK zip file. For example:

```sh
cd {@releasezipname}
```

To install the library from a local tarball for a Mac or Linux-based operating
system, run the following command:

```sh
npm install ./lib/{@releasetarballname} --save
```

To install the library from a local tarball for Windows, run:

```sh
npm install .\lib\{@releasetarballname} --save
```

To install the library via the
[npm package registry](https://www.npmjs.com/package/@opendxl/dxl-mar-client),
run:

```sh
npm install @opendxl/dxl-mar-client --save
```
