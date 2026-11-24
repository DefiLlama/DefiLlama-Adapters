const ADDRESSES = require('../helper/coreAssets.json')

const { USDG } = ADDRESSES.robinhood

const FUNDS = [
  '0x9319364eddbe1f58ead4b9ba2eef0f91a9c9cd30', // uYLD
  '0x7e059e67f50ab876433ab1f9acb0caf836697543', // uCMD
  '0xd8ce7a92934c72b53b5abf1476af1ac245bced62', // uSTK
]
const EARN = '0x96f37de93f012fea289a31b9362fbe4f8f075413'
const MAX_HOLDINGS = 50

async function tvl(api) {
  const counts = await api.multiCall({ abi: 'uint256:holdingsCount', calls: FUNDS })
  const calls = []
  counts.forEach((count, i) => {
    if (Number(count) > MAX_HOLDINGS) throw new Error(`untarred: ${FUNDS[i]} has ${count} holdings, cap ${MAX_HOLDINGS}`)
    for (let j = 0; j < Number(count); j++) calls.push({ target: FUNDS[i], params: [j] })
  })
  const holdings = await api.multiCall({ abi: 'function holdings(uint256) view returns (address)', calls })
  const tokensAndOwners = holdings.map((token, k) => [token, calls[k].target])
  FUNDS.forEach((fund) => tokensAndOwners.push([USDG, fund]))
  tokensAndOwners.push([USDG, EARN])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology:
    'Counts the USDG and holding tokens (tokenized treasuries, stocks, commodities and USDG vault shares) held by the uYLD, uCMD and uSTK vault funds, plus the USDG held by Untarred Earn. Assets moved to operator wallets or off-chain venues (Lighter hedges, Earn deployments) are not counted.',
  start: '2026-11-13',
  robinhood: { tvl },
}
