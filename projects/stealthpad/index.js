const { sumUnknownTokens } = require('../helper/unknownTokens')
const abi = require('./abi.js')

module.exports = {
  start: 17996063,
  methodology: `Counts liquidity in lp lock contracts`,
}

const config = {
  ethereum: { lockerManagerV1: '0x57136ec54ddafd1695479cae1140fbc6d5a916d1',},
}

Object.keys(config).forEach(chain => {
  const { lockerManagerV1, } = config[chain]
  module.exports[chain] = { tvl }

  async function tvl(_, _b, _cb, { api, }) {
    // const tokenInfos = await api.fetchList({  lengthAbi: abi.tokenLockerCount, itemAbi: abi.getTokenLockData, target: lockerManagerV1, })
    const lpInfos = await api.fetchList({  lengthAbi: abi.lpLockerCount, itemAbi: abi.getLpLockData, target: lockerManagerV1, })
    const tokensAndOwners = [lpInfos].flat().filter(i => i.isLpToken).map(l => [l.token, l.contractAddress])
    return sumUnknownTokens({ api, tokensAndOwners, useDefaultCoreAssets: true, resolveLP: true, onlyLPs: true, })
  }
})
