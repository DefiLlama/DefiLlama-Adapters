const BigNumber = require('bignumber.js');
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

const lnts = {
 arbitrum: [
  {
      // Aethir LntVault
      asset: '0xc87B37a581ec3257B734886d9d3a581F5A9d056c',
      vthook: '0xbf4b4A83708474528A93C123F817e7f2A0637a88',
      vt: '0x24ef95c39DfaA8f9a5ADf58edf76C5b22c34Ef46'
  }
 ],
}
async function tvlLNT(api) {
  const lntconfigs = lnts[api.chain] || []
  for (const lnt of lntconfigs) {
    const [isToken0VT, reserve0, reserve1, vtTotal] = await api.batchCall([
      { abi: 'bool:isToken0VT', target: lnt.vthook },
      { abi: 'uint256:reserve0', target: lnt.vthook },
      { abi: 'uint256:reserve1', target: lnt.vthook },
      { abi: 'uint256:totalSupply', target: lnt.vt }
    ])
    const assetBalance = isToken0VT ? reserve1 : reserve0
    const vtConvertToAsset = isToken0VT ? BigNumber(reserve1).multipliedBy(vtTotal).dividedBy(reserve0) : BigNumber(reserve0).multipliedBy(vtTotal).dividedBy(reserve1)
    api.add(lnt.asset, BigNumber(assetBalance).plus(vtConvertToAsset).toFixed(0))
  }
}

module.exports = {
  doublecounted: true,
  berachain: { tvl },
  arbitrum: { tvl: tvlLNT }
}