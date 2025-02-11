
async function tvl(api) {
  const zooProtocol = '0xc0fA386aE92f18A783476d09121291A1972C30Dc'
  const assets = await api.call({ abi: 'address[]:assetTokens', target: zooProtocol })

  // Normally, assets are routed to other vaults like Infrared, Yeet, etc
  const vaults = (await api.multiCall({ abi: 'function getVaultAddresses(address) view returns (address[])', calls: assets, target: zooProtocol })).flat()
  const assetBals = await api.multiCall({ abi: 'uint256:assetBalance', calls: vaults })
  api.add(assets, assetBals)

  // On vault close, assets are withdrawn from underlying vaults and held by the vault itself
  const tokensAndOwners = vaults.map((vault, i) => [assets[i], vault])


  // On every epoch close, a portion of assets are withdrawn from underlying vaults, and deposited to the redeem pool contract
  const epochInfoAbi = 'function epochInfoById(uint256 epochId) public view returns (uint256 epochId, uint256 startTime, uint256 duration, address redeemPool, address stakingBribesPool, address adhocBribesPool)'
  const epochInfos = await api.fetchList({ lengthAbi: 'epochIdCount', itemAbi: epochInfoAbi, targets: vaults, startFromOne: true, groupedByInput: true })

  epochInfos.forEach((infos, i) => {
    const asset = assets[i]
    infos.forEach(({ redeemPool }) => {
      tokensAndOwners.push([asset, redeemPool])
    })
  })

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  doublecounted: true,
  berachain: { tvl }
}