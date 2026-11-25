const ADDRESSES = require('../helper/coreAssets.json')

const { USDG } = ADDRESSES.robinhood
const { USDC } = ADDRESSES.base

const ROBINHOOD_FUNDS = [
  '0x9319364eddbe1f58ead4b9ba2eef0f91a9c9cd30', // uYLD
  '0x7e059e67f50ab876433ab1f9acb0caf836697543', // uCMD
  '0xd8ce7a92934c72b53b5abf1476af1ac245bced62', // uSTK
]
const ROBINHOOD_EARN = '0x96f37de93f012fea289a31b9362fbe4f8f075413'

const BASE_FUNDS = [
  '0x5986cc4e4c5980f134dce5375468b9660206fcbf', // uCMD
  '0xa336327045966cc03b0baf5fde165065e73b7089', // uNVDA
  '0x49aaa2a06d34c3015e9273d6f638fb65972d4fd9', // uGOOGL
  '0x5efd938f34bf47fecdc8149d29dfa6a78b6afc3a', // uMU
  '0x7e059e67f50ab876433ab1f9acb0caf836697543', // uSTK (paused)
]
const BASE_EARN = '0xe0c2d64c8c7eda3abbb217d46f01d0ef383f6f8f'
const MAX_HOLDINGS = 50

function makeTvl(funds, cash, earn) {
  return async function tvl(api) {
    const counts = await api.multiCall({ abi: 'uint256:holdingsCount', calls: funds })
    const calls = []
    counts.forEach((count, i) => {
      if (Number(count) > MAX_HOLDINGS) throw new Error(`untarred: ${funds[i]} has ${count} holdings, cap ${MAX_HOLDINGS}`)
      for (let j = 0; j < Number(count); j++) calls.push({ target: funds[i], params: [j] })
    })
    const holdings = await api.multiCall({ abi: 'function holdings(uint256) view returns (address)', calls })
    const tokensAndOwners = holdings.map((token, k) => [token, calls[k].target])
    funds.forEach((fund) => tokensAndOwners.push([cash, fund]))
    tokensAndOwners.push([cash, earn])
    return api.sumTokens({ tokensAndOwners })
  }
}

module.exports = {
  methodology:
    'Counts cash (USDG on Robinhood Chain, USDC on Base) and holding tokens (tokenized treasuries, stocks, commodities and yield vault shares) held by Untarred vault funds, plus cash held by Untarred Earn. Assets moved to operator wallets or off-chain venues (Lighter hedges, Earn deployments) are not counted.',
  start: '2026-11-13',
  robinhood: { tvl: makeTvl(ROBINHOOD_FUNDS, USDG, ROBINHOOD_EARN) },
  base: { tvl: makeTvl(BASE_FUNDS, USDC, BASE_EARN) },
}
