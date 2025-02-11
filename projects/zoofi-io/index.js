async function vaultBalance(api, vault) {
  const asset = await api.call({ abi: 'address:assetToken', target: vault })

  // Normally, assets are routed to other vaults like Infrared, Yeet, etc
  const underlyingBalance = await api.call({ abi: 'uint256:assetBalance', target: vault })

  // On vault close, assets are withdrawn from underlying vaults and held by the vault itself
  const selfBalance = await api.call({ abi: 'erc20:balanceOf', target: asset, params: [vault] })

  // On every epoch close, a portion of assets are withdrawn from underlying vaults, and deposited to the redeem pool contract
  const epochCount = await api.call({ abi: 'function epochIdCount() public view returns (uint256)', target: vault, params: [] })
  const epochIds = [...Array(epochCount).keys()].map(i => i + 1)

  const redeemPools = (await api.multiCall({ 
    abi: 'function epochInfoById(uint256 epochId) public view returns (uint256 epochId, uint256 startTime, uint256 duration, address redeemPool, address stakingBribesPool, address adhocBribesPool)',
    calls: epochIds, target: vault
  })).map(pool => pool.redeemPool)

  const redeemPoolBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: redeemPools, target: asset })
  const redeemPoolBalancesTotal = redeemPoolBalances.reduce((acc, balance) => acc + Number(balance), 0)

  const totalBalance = Number(underlyingBalance) + Number(selfBalance) + redeemPoolBalancesTotal
  api.add(asset, totalBalance)
}

async function tvl(api) {
  const zooProtocol = '0xc0fA386aE92f18A783476d09121291A1972C30Dc'
  const assets = await api.call({ abi: 'address[]:assetTokens', target: zooProtocol })
  const vaults = (await api.multiCall({ abi: 'function getVaultAddresses(address) view returns (address[])', calls: assets, target: zooProtocol })).flat()
  await Promise.all(vaults.map(vault => vaultBalance(api, vault)))
}

module.exports = {
  doublecounted: true,
  berachain: { tvl }
}