const USTB = '0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd'

module.exports = {
  misrepresentedTokens: true,
  real: {
    tvl: async (api) => {
      const basketManager = '0x5e581ce0472bF528E7F5FCB96138d7759AC2ac3f'.toLowerCase()
      // get all baskets in existance
      const baskets = await api.call({ abi: 'address[]:getBasketsArray', target: basketManager })
      for (let i = 0; i < baskets.length; i++) {
        const basketTVL = await api.call({ abi: 'uint256:getTotalValueOfBasket', target: baskets[i].toLowerCase() })
        api.add(USTB, basketTVL)
      }
    },
  }
}