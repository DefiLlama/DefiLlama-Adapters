const ADDRESSES = require('../helper/coreAssets.json')
const USTB = ADDRESSES.ethereum.USTB

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: USTB })
      api.add(USTB, supply)
    },
  },
  real: {
    tvl: async (api) => {
      const basketManager = '0x5e581ce0472bF528E7F5FCB96138d7759AC2ac3f'.toLowerCase()
      // get all baskets in existance
      const baskets = await api.call({ abi: 'address[]:getBasketsArray', target: basketManager })
      for (let i = 0; i < baskets.length; i++) {
        const basketTVL = await api.call({ abi: 'uint256:getTotalValueOfBasket', target: baskets[i].toLowerCase() })
        console.log(basketTVL)
        api.add(USTB, basketTVL)
      }
    },
  }
}