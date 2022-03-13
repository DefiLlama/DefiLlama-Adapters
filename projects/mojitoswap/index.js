const { MJT_GRAPH } = require("./query");
const { getChainTvl, getStakeLockValue } = require("./utils");
const { staking } = require("../helper/staking.js");

const graphUrls = {
  kcc: MJT_GRAPH,
};

const chainTvl = getChainTvl(graphUrls);
const stakeValue = getStakeLockValue();

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "We count liquidity and staking on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: chainTvl("kcc"),
    staking: staking("0x25c6d6a65c3ae5d41599ba2211629b24604fea4f","0x2ca48b4eea5a731c2b54e7c3944dbdb87c0cfb6f", "kcc"),
  },
  
};
