const MasterMagpieAbi = require("../magpiexyz/abis/masterMagpie.json");
const config = require("./config");
const { staking } = require('../helper/staking')

async function tvl(api) {
  const { masterPenpie, vlPNP } = config[api.chain];

  const poolTokens = await api.fetchList({
    lengthAbi: MasterMagpieAbi.poolLength,
    itemAbi: MasterMagpieAbi.registeredToken,
    target: masterPenpie,
  });
  const poolInfos = await api.multiCall({ abi: 'function getPoolInfo(address) view returns ( uint256 emission, uint256 allocpoint, uint256 sizeOfPool, uint256 totalPoint)', calls: poolTokens, target: masterPenpie, })
  poolTokens.forEach((token, i) => {
    api.add(token, poolInfos[i].sizeOfPool)
  })
  if (vlPNP)
    api.removeTokenBalance(vlPNP)
}

Object.keys(config).forEach((chain) => {
  const { PNP, vlPNP, } = config[chain];

  module.exports[chain] = {
    tvl,
  };
  if (PNP && vlPNP) module.exports[chain].staking = staking(vlPNP, PNP)
});

module.exports.doublecounted = true
