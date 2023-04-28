const { getFactoryTvl } = require("../terraswap/factoryTvl");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  terra2: {
    tvl: getFactoryTvl("terra1pewdsxywmwurekjwrgvjvxvv0dv2pf8xtdl9ykfce2z0q3gf0k3qr8nezy"),
  },
};
