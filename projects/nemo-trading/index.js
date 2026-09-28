const { getLogs2 } = require('../helper/cache/getLogs')

const vaults = [
  '0x955256B31097dDf47a9E47A95aDfDFB4460D8522', // USDC Prime
  '0xA422C3018C46ba90a14AcD14f96CB60616F5c91B', // ETH Prime
]

async function tvl(api) {
  const [assets, totals, receiptTokens] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: vaults }),
    api.multiCall({ abi: 'uint256:getTotalAssets', calls: vaults }),
    api.multiCall({ abi: 'address:lpTokenAddress', calls: vaults }),
  ])
  const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: receiptTokens })
  const accounts = await Promise.all(vaults.map(async vault => {
    const logs = await getLogs2({ api, target: vault, eventAbi: 'event SubAccountEnabled(address subAccountAddr)', fromBlock: 20000000 })
    const candidates = [...new Set(logs.map(log => log.subAccountAddr))]
    const enabled = await api.multiCall({ abi: 'function whitelistedSubAccounts(address) view returns (uint8)', calls: candidates.map(account => ({ target: vault, params: account })) })
    return [vault, ...candidates.filter((_, i) => Number(enabled[i]) > 0)]
  }))
  for (let i = 0; i < vaults.length; i++) {
    const otherAccounts = [...new Set(accounts.filter((_, j) => j !== i).flat())]
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: otherAccounts.map(owner => ({ target: receiptTokens[i], params: owner })) })
    const internalShares = balances.reduce((sum, balance) => sum + BigInt(balance), 0n)
    const supply = BigInt(supplies[i])
    if (internalShares > supply) throw new Error('Internal shares exceed receipt supply')
    const nestedAssets = supply === 0n ? 0n : BigInt(totals[i]) * internalShares / supply
    api.add(assets[i], BigInt(totals[i]) - nestedAssets)
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'Sum NEMO USDC Prime and ETH Prime on-chain NAV, subtracting pro-rata NAV of receipt shares held by the other vault and its enabled subaccounts. Upshift and underlying strategies remain globally double-counted.',
  ethereum: { tvl },
}
