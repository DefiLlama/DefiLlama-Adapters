const MasterMagpieAbi = require("../magpiexyz/abis/masterMagpie.json");
const config = require("./config");
const { staking } = require('../helper/staking')

async function tvl(api) {
  const { masterPenpie, vlPNP, pendleStaking, mPENDLE, } = config[api.chain];

  const poolTokens = await api.fetchList({
    lengthAbi: MasterMagpieAbi.poolLength,
    itemAbi: MasterMagpieAbi.registeredToken,
    target: masterPenpie,
  });
  const blacklistedTokens = []
  if (vlPNP) blacklistedTokens.push(vlPNP)
  if (mPENDLE && masterPenpie) await api.sumTokens({ tokens: [mPENDLE], owner: masterPenpie })
  return api.sumTokens({ tokens: poolTokens, owner: pendleStaking, blacklistedTokens })
}

Object.keys(config).forEach((chain) => {
  const { PNP, vlPNP, } = config[chain];

  module.exports[chain] = {
    tvl,
  };
  if (PNP && vlPNP) module.exports[chain].staking = staking(vlPNP, PNP)
});

module.exports.doublecounted = true
