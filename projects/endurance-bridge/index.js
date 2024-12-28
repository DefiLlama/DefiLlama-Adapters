const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const config = {
  ace: {
    bridges: [
      '0xf3310e3f0D46FF5EE7daB69C73452D0ff3979Bed',
    ],
    tokens: [nullAddress]
  },
}

Object.keys(config).forEach(chain => {
  const { bridges, tokens } = config[chain]
  module.exports[chain] = { tvl: sumTokensExport({ tokens, owners: bridges, }) }
})