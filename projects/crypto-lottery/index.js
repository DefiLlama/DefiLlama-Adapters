const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const DEFAULT_CONTRACT = '0x80b313Be000c42f1f123C7FBd74654544818Ba7c';
const BSC_CONTRACT = '0xbB183c396392d08B5f4b19909C7Ce58f9c86F637';
const config = {
  bsc: [BSC_CONTRACT],
  csc: [DEFAULT_CONTRACT],
  celo: [DEFAULT_CONTRACT],
  polygon: [DEFAULT_CONTRACT],
  kcc: ['0xED6aDb0d3340005C24B90B810b47bd8648e20199'],
  avax: [DEFAULT_CONTRACT],
}

module.exports = {
  methodology: "We count of smart contract balance in coins",
  deadFrom: "2024-09-11", 
  hallmarks: [
    ['2024-09-11', 'Closed due to lack of interest'],
  ],
}

Object.keys(config).forEach(chain => {
  const owners = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokens: [nullAddress], owners, })
  }
})
