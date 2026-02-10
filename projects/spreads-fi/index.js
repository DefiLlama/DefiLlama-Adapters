const ADDRESSES = require('../helper/coreAssets.json')

  const sprUSD = '0xc59f7870d47af6d0e3de87b8681775b5476d3e8d'

  module.exports = {
    methodology: 'TVL is the total supply of sprUSD, which is always redeemable 1:1 for USDC.',
    ethereum: {
      tvl: async (api) => {
        const supply = await api.call({ abi: 'erc20:totalSupply', target: sprUSD })
        // sprUSD has 18 decimals, USDC has 6 decimals — divide to convert
        api.add(ADDRESSES.ethereum.USDC, supply / 1e12)
      },
    }
  }
