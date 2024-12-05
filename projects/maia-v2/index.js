const { sumTokens2 } = require('../helper/unwrapLPs')

async function voteMaiaTVL() {
  const vMaiaAddress = '0x000000f0C01c6200354f240000b7003668B4D080'
  return await sumTokens2({
    owner: vMaiaAddress,
    chain: "arbitrum",
    resolveUniV3: true,
    tokens: ['0x00000000ea00F3F4000e7Ed5Ed91965b19f1009B']
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Total Maia staked in VoteMaia.',
  arbitrum: {
    tvl: () => 0,
    staking: voteMaiaTVL,
  },
};
