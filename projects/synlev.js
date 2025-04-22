const { sumTokensExport, nullAddress } = require('./helper/unwrapLPs');

module.exports = {
  deadFrom: 1648765747,
  ethereum: {
    tvl: sumTokensExport({ owners: ['0xFf40827Ee1c4Eb6052044101E1C6E28DBe1440e3', '0xA81f8460dE4008577e7e6a17708102392f9aD92D'], tokens: [nullAddress]})
  }
}
