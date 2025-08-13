const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const token = ADDRESSES.bsc.wBETH

async function getExchangeRate() {
  return (await sdk.api.abi.call({
    abi: "uint256:exchangeRate",
    target: token,
  })).output;
}

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      ["ethereum:" + ADDRESSES.null]: (await sdk.api.erc20.totalSupply({ target: token, block })).output * await getExchangeRate() / 1e18
    })
  },
  bsc: {
    tvl: async (_, block, chainBlocks) => ({
      ["bsc:" + ADDRESSES.bsc.ETH]: (await sdk.api.erc20.totalSupply({ target: token, chain: "bsc", block: chainBlocks.bsc })).output * await getExchangeRate() / 1e18
    })
  }
}
