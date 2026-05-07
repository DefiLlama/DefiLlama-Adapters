const { get } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')
const { addTonBalances, addJettonBalances } = require('../helper/chain/ton')
const { sleep } = require('../helper/utils')

const TON_ADDRESS = '0:0000000000000000000000000000000000000000000000000000000000000000'


module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async (api) => {
      const response = await get('https://bidask.finance/api/pools?size=1000&all=false')
      const pools = response.result;

      const tokenToPoolsMap = {}

      pools.forEach(pool => {
        const tokenXAddress = pool.tokens.token_x.address
        const tokenYAddress = pool.tokens.token_y.address === TON_ADDRESS ? ADDRESSES.ton.TON : pool.tokens.token_y.address

        tokenToPoolsMap[tokenXAddress] ??= []
        tokenToPoolsMap[tokenXAddress].push(pool.address)

        tokenToPoolsMap[tokenYAddress] ??= []
        tokenToPoolsMap[tokenYAddress].push(pool.address)
      })

      for (const tokenAddress in tokenToPoolsMap) {
        if (ADDRESSES.ton.TON === tokenAddress) {
          await addTonBalances({ api, addresses: tokenToPoolsMap[tokenAddress] })
        } else {
          await addJettonBalances({ api, jettonAddress: tokenAddress, addresses: tokenToPoolsMap[tokenAddress] })
        }
        await sleep(1000)
      }
    }
  }
}
