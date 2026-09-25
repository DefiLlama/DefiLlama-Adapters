// Crossbow - private per-depositor LP vaults on Robinhood Chain
const FACTORY = '0x27658bD271449cD7467Cdb0FD6E6C32F789E9eFB' // ManifoldFactoryRH
const FROM_BLOCK = 64574208 // first vault deployment
const VAULT_DEPLOYED_TOPIC = '0x240fc14917e6e1554c81cfb539719a310c54751a7bfacbebcd20672d4d5fd0af'

const abi = {
  contributedUSD: 'function contributedUSD() view returns (uint256)',
  withdrawnUSD: 'function withdrawnUSD() view returns (uint256)',
}

async function tvl(api) {
  const toBlock = await api.getBlock()
  const logs = await api.getLogs({
    target: FACTORY, topic: VAULT_DEPLOYED_TOPIC, fromBlock: FROM_BLOCK, toBlock,
  })
  const vaults = [...new Set(logs.map(l => '0x' + l.topics[1].slice(-40)))]

  const [contributed, withdrawn] = await Promise.all([
    api.multiCall({ abi: abi.contributedUSD, calls: vaults, permitFailure: true }),
    api.multiCall({ abi: abi.withdrawnUSD, calls: vaults, permitFailure: true }),
  ])

  // Each vault books deposits and withdrawals in USD at 18 decimals.
  let net = 0n
  vaults.forEach((_, i) => {
    if (!contributed[i]) return
    const c = BigInt(contributed[i])
    const w = BigInt(withdrawn[i] || 0)
    if (c > w) net += c - w
  })

  api.addUSDValue(Number(net) / 1e18)
}

module.exports = {
  methodology:
    'Every Crossbow vault is enumerated from the ManifoldFactoryRH vault-deployment event. Each vault books its deposits and withdrawals in USD on-chain (contributedUSD / withdrawnUSD, 18 decimals); TVL is the sum of net contributions across all vaults. Capital is deployed as concentrated liquidity into Uniswap v4 hook pools and Slipstream-style CL positions on Robinhood Chain, so this is doublecounted against those DEXs.',
  doublecounted: true,
  robinhood: { tvl },
}
