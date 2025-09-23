const MasterMagpieAbi = require("../magpiexyz/abis/masterMagpie.json");
const config = require("./config");
const { staking } = require('../helper/staking')

async function tvl(api) {
  const { masterPenpie, vlPNP, pendleStaking, mPENDLE, PNP } = config[api.chain];

  // Get main protocol TVL (Pendle staking + mPENDLE)
  const poolTokens = await api.fetchList({
    lengthAbi: MasterMagpieAbi.poolLength,
    itemAbi: MasterMagpieAbi.registeredToken,
    target: masterPenpie,
  });
  const blacklistedTokens = []
  if (vlPNP) blacklistedTokens.push(vlPNP)
  if (mPENDLE && masterPenpie) await api.sumTokens({ tokens: [mPENDLE], owner: masterPenpie })
  
  // Add staking TVL if PNP and vlPNP exist
  if (PNP && vlPNP) {
    await api.sumTokens({ tokens: [PNP], owner: vlPNP })
  }
  
  return api.sumTokens({ tokens: poolTokens, owner: pendleStaking, blacklistedTokens })
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});

module.exports.doublecounted = true
