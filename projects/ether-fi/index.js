const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

function staking(contract, token) {
  return async (api) => {
    api.add(token, await api.call({ target: contract, abi: 'erc20:totalSupply'}))
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", ADDRESSES.ethereum.ETHFI),
    tvl: async ({ timestamp }) => {
      const api = new sdk.ChainApi({ timestamp, chain: 'optimism' })
      await api.getBlock()
      return {
        [nullAddress]: await api.call({ target: '0x6329004E903B7F420245E7aF3f355186f2432466', abi: 'uint256:getTvl' })
      }
    }
  },
  arbitrum:{
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", ADDRESSES.arbitrum.ETHFI)
  }
}
