const { getFactoryTvl } = require("../terraswap/factoryTvl");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  terra2: {
    tvl: getFactoryTvl(
      "terra1jy84vk4gykw76hr4lydmkz55rzsfsk4v0nn4qjjzkpt00vvstrxqytlgjq"
    ),
  },
}; // node test.js projects/ura/index.js
