async function tvl(api) {
  const protocolConfigs = [
    {
      protocol: '0xc0fA386aE92f18A783476d09121291A1972C30Dc',
    },
    {
      protocol: '0x4737c3BAB13a1Ad94ede8B46Bc6C22fb8bBE9c81',
    }
  ]

  const tokensAndOwners = []
  
  for (const { protocol: zooProtocol } of protocolConfigs) {
    const assets = await api.call({ abi: 'address[]:assetTokens', target: zooProtocol })

    const vaults = (await api.multiCall({ abi: 'function getVaultAddresses(address) view returns (address[])', calls: assets, target: zooProtocol })).flat()

    const assetBals = await Promise.all(vaults.map(async (vault) => {
      try {
        return await api.call({ abi: 'uint256:assetBalance', target: vault })
      } catch (e) {
        // It seems that if uint256:assetBalance returns '0x', api.call throws an error
        // console.log(`Error getting assetBalance for vault ${vault}, defaulting to 0`)
        return '0'
      }
    }))
    
    api.add(assets, assetBals)

    // Add vault balances
    vaults.forEach((vault, i) => tokensAndOwners.push([assets[i], vault]))

    // Add redeem pool balances
    const epochInfoAbi = 'function epochInfoById(uint256 epochId) public view returns (uint256 epochId, uint256 startTime, uint256 duration, address redeemPool, address stakingBribesPool, address adhocBribesPool)'
    const epochInfos = await api.fetchList({ lengthAbi: 'epochIdCount', itemAbi: epochInfoAbi, targets: vaults, startFromOne: true, groupedByInput: true })

    epochInfos.forEach((infos, i) => {
      const asset = assets[i]
      infos.forEach(({ redeemPool }) => {
        tokensAndOwners.push([asset, redeemPool])
      })
    })
  }

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  doublecounted: true,
  berachain: { tvl }
}