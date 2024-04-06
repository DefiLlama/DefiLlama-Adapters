const ADDRESSES = require('./helper/coreAssets.json')
const { sumLPWithOnlyOneToken } = require("./helper/unwrapLPs");
const { stakingUnknownPricedLP } = require("./helper/staking");

async function pool2(timestamp, block, chainBlocks) {
  const balances = {};
  await sumLPWithOnlyOneToken(balances, "0xB31Ecb43645EB273210838e710f2692CC6b30a11", "0x5d350F07c1D9245c1Ecb7c622c67EDD49c6a0A35", ADDRESSES.bsc.WBNB, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`)
  return balances
}

module.exports = {
  misrepresentedTokens: true,
    bsc: {
    tvl: () => ({}),
    pool2,
    staking: stakingUnknownPricedLP("0xC77CfF4cE3E4c3CB57420C1488874988463Fe4a4", "0x232fb065d9d24c34708eedbf03724f2e95abe768","bsc", "0xb31ecb43645eb273210838e710f2692cc6b30a11"),
  },
};
