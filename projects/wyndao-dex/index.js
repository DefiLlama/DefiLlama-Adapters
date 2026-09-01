const { getFactoryTvl } = require('../terraswap/factoryTvl')
const { getBalance, } = require('../helper/chain/cosmos')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  juno: {
    tvl: getFactoryTvl("juno16adshp473hd9sruwztdqrtsfckgtd69glqm6sqk0hc4q40c296qsxl3u3s",),
    staking: async () => {
      return {
        'wynd': await getBalance({ chain: 'juno', token: 'juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9', owner: 'juno1sy9mlw47w44f94zea7g98y5ff4cvtc8rfv75jgwphlet83wlf4ssa050mv' }) / 1e6
      }
    }
  },
}