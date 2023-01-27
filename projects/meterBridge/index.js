const addresses = require("./addresses.json");
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk')

module.exports = {};

Object.keys(addresses).forEach(chain => {
  const { ERC20Handler: owner, Tokens } = addresses[chain]

  module.exports[chain] = {
    tvl: sumTokensExport({ chain, owner, tokens: [nullAddress, ...Tokens] })
  }

  if (chain === 'ethereum') {
    module.exports.ethereum.tvl = sdk.util.sumChainTvls([
      module.exports.ethereum.tvl,
      sumTokensExport({
        tokensAndOwners: [
          ['0xd46ba6d942050d489dbd938a2c909a5d5039a161', '0x805c7ecba41f9321bb098ec1cf31d86d9407de2f',],
        ]
      })
    ])
  }
})
