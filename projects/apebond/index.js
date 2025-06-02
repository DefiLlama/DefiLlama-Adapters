const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0x34ef7df17a7e9a51e0b308ac3280b08379deda33', fromBlock: 18745159, },
  polygon: { factory: '0x1ce1b8e28e4d4c1c4da01b69f5434a9fb7be023d', fromBlock: 50910011, },
  bsc: '0x9D09925567FA16f8b9E646C5d35475cc235C66d9',
}

const ownTokens = {
  ethereum: '0xe6828D65bf5023AE1851D90D8783Cc821ba7eeE1',
  bsc: '0x34294afabcbaffc616ac6614f6d2e17260b78bed',
  polygon: '0xe6828d65bf5023ae1851d90d8783cc821ba7eee1',
}

Object.keys(config).forEach(chain => {
  const _config = config[chain]

  function getTvl(api, isStaking) {
    const ownToken = ownTokens[chain]
    if (!isStaking) {
      api.removeTokenBalance(ownToken)
    } else {
      const regex = new RegExp(ownToken, 'i')
      Object.keys(api.getBalances()).forEach(key => {
        if (!regex.test(key))
          api.removeTokenBalance(key)
      })
    }

    return api.getBalances()
  }

  const poolManagerTvl = (isStaking) => async (api) => {
    const factory = _config
    const manager = await api.call({ abi: 'address:poolManager', target: factory })
    const allLegacyPools = await api.call({ abi: 'address[]:allLegacyPools', target: manager })
    const allNewPools = await api.call({ abi: 'address[]:allNewPools', target: manager })
    const tokensLegacy = await api.multiCall({ abi: 'address:stakeToken', calls: allLegacyPools })
    const tokensNew = await api.multiCall({ abi: 'address:STAKE_TOKEN', calls: allNewPools })
    const tokens = [...tokensLegacy, ...tokensNew]
    const owners = [...allLegacyPools, ...allNewPools]
    await sumTokens2({ api, tokensAndOwners2: [tokens, owners], resolveLP: true, resolveIchiVault: true, })
    return getTvl(api, isStaking)
  }

  const logTvl = (isStaking) => async (api) => {
    const { factory, fromBlock } = _config
    const logs = await getLogs({
      api,
      target: factory,
      eventAbi: 'event DeployedPoolContract (address indexed pool, address stakeToken, address rewardToken, uint256 rewardPerSecond, uint256 startTime, uint256 bonusEndTime, address owner)',
      onlyArgs: true,
      fromBlock,
    })
    const tokensAndOwners = logs.map(log => [log.stakeToken, log.pool])
    await sumTokens2({ api, tokensAndOwners, resolveLP: true, resolveIchiVault: true, })
    return getTvl(api, isStaking)
  }
  const tvlFunction = typeof _config === 'string' ? poolManagerTvl : logTvl
  module.exports[chain] = {
    tvl: tvlFunction(false),
    staking: tvlFunction(true),
  }


})