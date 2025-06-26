const { getFactoryTvl } = require("../terraswap/factoryTvl");

const factory = {
  classic: "inj1pc2vxcmnyzawnwkf03n2ggvt997avtuwagqngk",
};

async function staking() {

  return {}
 /*  /// POOLS
  const response = await fetch('https://analytics.dojo.trading/dashboard/pools/tvl');
  const data = await response.json();
  const keys = Object.keys(data);
  const tvl = keys.reduce((tvl, key) => tvl + data[key].tvl, 0);

  return {
    tether: tvl
  } */
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  injective: { tvl: getFactoryTvl(factory.classic), staking: staking },
};
