const { getFactoryTvl } = require("./factoryTvl");

const factory = {
  classic: "inj1pc2vxcmnyzawnwkf03n2ggvt997avtuwagqngk",
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  injective: { tvl: getFactoryTvl(factory.classic) },
};
