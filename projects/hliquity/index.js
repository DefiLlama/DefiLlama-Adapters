const { nullAddress, sumTokens2 } = require("../helper/unwrapLPs");

const ACTIVE_POOL_CONTRACT = '0x00000000000000000000000000000000005c9f0b';
async function tvl(api) {
  await sumTokens2({ api, owner: ACTIVE_POOL_CONTRACT, token: nullAddress })
}

module.exports = {
  methodology: 'the amount of locked hbar in the HLiquity protocol',
  hedera: {
    tvl,
  }
};
