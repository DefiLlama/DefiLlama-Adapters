const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

// https://docs.uwu.cash/developers/deployed-contracts
module.exports = {
  stacks: {
    tvl: sumTokensExport({
      owners: ['SP2AKWJYC7BNY18W1XXKPGP0YVEK63QJG4793Z2D4.uwu-factory-v1-1-0'],
      tokens: [nullAddress]
    }),
  }
};