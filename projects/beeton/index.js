const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  timetravel: false,
  methodology: 'The actual size of the TON pool for the BEETON token on the DEX DeDust',
  ton: {
    tvl: async () => {
      const pools = await get('https://api.dedust.io/v1/pools')
      const beeton = pools.filter(i => i.address === 'EQAsxDhDoKNCOJdwPKTXuyOutl9bUFJhnEDBSbxAiSUrfUuG') //The address of the BEETON's pool on the DEX DeDust

      return transformDexBalances({
        chain: 'ton',
        data: beeton.map(i => ({
          token0: i.left_token_root, //BEETON's address (EQCRU1SC3xNf_r33q8NZzLughmvdE21JRYIZj4oRKUdRKRDb)
          token1: i.right_token_root, //TON's address (EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c)
          token0Bal: i.left_token_reserve,
          token1Bal: i.right_token_reserve,
        }))
      })
    }
  }
}
