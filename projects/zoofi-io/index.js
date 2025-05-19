async function tvl(api) {
  const protocols = [
    '0xc0fA386aE92f18A783476d09121291A1972C30Dc',
    '0x4737c3BAB13a1Ad94ede8B46Bc6C22fb8bBE9c81',
    '0x9F0956c33f45141a7D8D5751038ae0A71C562f87',
    '0xd75Dc0496826FF0C13cE6D6aA5Bf8D64126E4fF1'
  ]

  const tokensAndOwners = []

  for (const zooProtocol of protocols) {
    const assets = await api.call({ abi: 'address[]:assetTokens', target: zooProtocol })

    const vaults = (await api.multiCall({ abi: 'function getVaultAddresses(address) view returns (address[])', calls: assets, target: zooProtocol })).flat()
    const assetBals = await api.multiCall({ abi: 'uint256:assetBalance', calls: vaults, permitFailure: true })
    api.add(assets, assetBals.map(i => i ?? 0))

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