const { sumUnknownTokens, sumTokensExport } = require('../helper/unknownTokens')
const lpLockerCount = 'function lpLockerCount() view returns (uint40)'
const tokenLockerCount = 'function tokenLockerCount() view returns (uint40)'

const getLpLockData = `function getLpLockData(uint40 id_) view returns
(
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 blockTime,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
)`
const getTokenLockData = `function getTokenLockData(uint40 id_) view returns
(
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 blockTime,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
)`

const abi = {
    lpLockerCount,
    tokenLockerCount,
    getLpLockData,
    getTokenLockData,
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts liquidity in lp lock contracts`,
}

const config = {
  ethereum: { lockerManagerV1: '0x57136ec54ddafd1695479cae1140fbc6d5a916d1', stakingContract: '0x23dDCc4787bc8CC3b433782b7d9b876da467533F', stakingToken: '0xB18F98822C22492Bd6b77D19cae9367f3D60fcBf', lps: ['0x626BB5e02694372b5A919A5981659595C2FD3788'] },
}

Object.keys(config).forEach(chain => {
  const { lockerManagerV1, stakingContract, stakingToken, lps } = config[chain]
  module.exports[chain] = { tvl, }

  async function tvl(api) {
    const lpInfos = await api.fetchList({  lengthAbi: abi.lpLockerCount, itemAbi: abi.getLpLockData, target: lockerManagerV1, })
    const tokensAndOwners = [lpInfos].flat().filter(i => i.isLpToken).map(l => [l.token, l.contractAddress])
    return sumUnknownTokens({ api, tokensAndOwners, useDefaultCoreAssets: true, resolveLP: true, onlyLPs: true, })
  }

  if (stakingContract && stakingToken) {
    module.exports[chain].staking = sumTokensExport({ tokens: [stakingToken], chain, owner: stakingContract, useDefaultCoreAssets: true, lps })
  }
})
