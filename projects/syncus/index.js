const { staking } = require('../helper/staking')
const { aaveV2Export } = require('../helper/aave')

const stakingAddress = "0xc738CDb5140d6b7F688ba05a25c8a51568622D96";
const syncAddress = "0xa41d2f8Ee4F47D3B860A149765A7dF8c3287b7F0";
module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(stakingAddress, syncAddress),
  },
  era: aaveV2Export('0xaa71728Aa548658FAbBd37C72C0e2a6234c193F1', { blacklistedTokens: ['0x2d20b8891f2f9ed0ebf1b179b2279f936dec9282']})
};
