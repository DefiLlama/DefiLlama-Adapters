const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const { staking } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");

const chainTvl = getChainTvl({
  ethereum:
    "https://api.thegraph.com/subgraphs/name/sunflowerswap/sunflowerswapv2",
});

const masterChef = "0x8E678b655A6b6e7f31747557a6a90A529B67A990";
const SFR = "0x8ab98c28295ea3bd2db6ac8b3ca57a625c054bd1";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(masterChef, SFR),
    pool2: pool2BalanceFromMasterChefExports(masterChef, SFR),
    tvl: chainTvl("ethereum"),
  },
  methodology:
    "TVL accounts for the liquidity on all AMM pools, using the TVL chart on http://info.sunflowerswap.finance/home as the source",
};
