const BigNumber = require("bignumber.js");
const { getFactoryTvl } = require("../terraswap/factoryTvl");

const factory = {
  classic: "inj1pc2vxcmnyzawnwkf03n2ggvt997avtuwagqngk",
};

async function staking() {

  /// POOLS
  const response = await fetch('https://analytics.dojo.trading/dashboard/pools/tvl');
  const data = await response.json();
  const keys = Object.keys(data);
  const tvl = keys.reduce((tvl, key) => tvl + data[key].tvl, 0);

  /// LSD
  const response2 = await fetch('https://analytics.dojo.trading/dashboard/ldp');
  const data2 = await response2.json();
  const state = (new BigNumber(data2?.state?.tvl_utoken)).div(new BigNumber(10 ** 18)) || new BigNumber(0);

  /// INJ price
  const response3 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=injective-protocol&vs_currencies=usd');
  const data3 = await response3.json();
  const injPrice = data3['injective-protocol'].usd;

  const lsdTvl = state.multipliedBy(injPrice).toNumber();

  // NOTE: TVL is already tracked in USD on API
  return {
    tether: tvl + lsdTvl,
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  injective: { tvl: getFactoryTvl(factory.classic), staking: staking },
};
