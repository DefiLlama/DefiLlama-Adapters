const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  juno: {
    tvl: async () => {
      const data = await get('https://api.wynddao.com/pools')
      return transformDexBalances({
        chain: 'juno',
        data: Object.values(data).map(i => ({
          token0: i[0].token ?? i[0].native,
          token0Bal: i[0].amount ?? 0,
          token1: i[1].token ?? i[1].native,
          token1Bal: i[1].amount ?? 0,
        }))
      })
    },
    staking: async () => {
      const data = await get('https://lcd-juno.cosmostation.io/wasm/contract/juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9/smart/7b2262616c616e6365223a7b2261646472657373223a226a756e6f317379396d6c7734377734346639347a6561376739387935666634637674633872667637356a677770686c65743833776c66347373613035306d76227d7d?encoding=UTF-8')
      return {
        'wynd': JSON.parse(atob(data.result.smart)).balance / 1e6
      }
    }
  }
}