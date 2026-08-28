const { aQuery } = require('../helper/chain/aptos');

const DECIMALS = 1e6;
const CC_TON_VALUE = 75.0;

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  aptos: {
    tvl: async (api) => {
      const { data: { current } } = await aQuery('/v1/accounts/0x11528bb9cfe00381469a8780db885bbc39b593da5dfb7ea977fc78ec0052a30b/resource/0x1::fungible_asset::ConcurrentSupply')
      api.addUSDValue(current.value * CC_TON_VALUE / DECIMALS)
    }
  }
}