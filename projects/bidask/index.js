const { get } = require('../helper/http')
const { sumTokensExport } = require('../helper/chain/ton')
const ADDRESSES = require('../helper/coreAssets.json')
const { sliceIntoChunks } = require('../helper/utils')

const TON_ADDRESS = '0:0000000000000000000000000000000000000000000000000000000000000000'

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async (api) => {
      const response = await get('https://bidask.finance/api/pools?size=1000&all=false')
      const pools = response.result;

      const chunks = sliceIntoChunks(pools, 5)

      for (const chunk of chunks) {
        await Promise.all(chunk.map((pool) => {
          const tokenYAddress = pool.tokens.token_y.address === TON_ADDRESS ? ADDRESSES.ton.TON : pool.tokens.token_y.address;

          return sumTokensExport({
            owner: pool.address,
            tokens: [pool.tokens.token_x.address, tokenYAddress],
          })(api)
        }))
      }
    }
  }
}
