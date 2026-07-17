const ADDRESSES = require('../helper/coreAssets.json')

const XRESERVE = '0x8888888199b2Df864bf678259607d6D5EBb4e3Ce'
const START_DOMAIN = 10001
const BATCH_SIZE = 10

async function tvl(api) {
  const domains = []
  for (let domain = START_DOMAIN; ; domain += BATCH_SIZE) {
    const batch = Array.from({ length: BATCH_SIZE }, (_, i) => domain + i)
    const registered = await api.multiCall({
      calls: batch.map((domain) => ({ target: XRESERVE, params: [domain] })),
      abi: 'function isRemoteDomainRegistered(uint32 domain) view returns (bool)',
    })
    const active = batch.filter((_, i) => registered[i])
    domains.push(...active)
    if (active.length < BATCH_SIZE) break
  }

  const balances = await api.multiCall({
    calls: domains.map((domain) => ({ target: XRESERVE, params: [ADDRESSES.ethereum.USDC, domain] })),
    abi: 'function balanceOfNativeCollateral(address token, uint32 domain) view returns (uint256)',
  })
  balances.forEach((balance) => api.add(ADDRESSES.ethereum.USDC, balance))
}

module.exports = {
  methodology: 'USDC collateral backing USDCx, read per destination domain from the xReserve contract via balanceOfNativeCollateral. The collateral is physically custodied in the shared Circle Gateway wallet, so this adapter is marked doublecounted and excluded from parent TVL.',
  ethereum: { tvl },
}
