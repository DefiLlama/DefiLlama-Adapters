const ADDRESSES = require('../helper/coreAssets.json')

const MONY = '0x6a7c6aa2b8b8a6A891dE552bDEFFa87c3F53bD46'
const MONY_DECIMALS = 4
const USDC_DECIMALS = 6

module.exports = {
  methodology: 'TVL is the total supply of MONY tokens, each representing $1 of the underlying US Treasury money market fund.',
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: MONY })
      api.add(ADDRESSES.ethereum.USDC, supply * 10 ** (USDC_DECIMALS - MONY_DECIMALS))
    }
  }
}
