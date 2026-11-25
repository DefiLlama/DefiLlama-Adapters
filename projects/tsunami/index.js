const FACTORY = '0x5934a5C377309453746EE8aa5194F671930c09fa'
const ACCOUNT_FACTORY = '0xAA549CB621d3cc411B0029610dbE3E2E08A3A8FF' // Riptide creator agent accounts
const ACCOUNT_FACTORY_BLOCK = 58867078

const abi = {
  getLaunchedTokens: 'function getLaunchedTokens() view returns (address[])',
  tokenCurves: 'function tokenCurves(address) view returns (address)',
  tokenQuotes: 'function tokenQuotes(address) view returns (address)',
  accountCount: 'function accountCount(address) view returns (uint256)',
  accountAt: 'function accountAt(address, uint256) view returns (address)',
}

async function tvl(api) {
  const tokens = await api.call({ target: FACTORY, abi: abi.getLaunchedTokens })
  const [curves, quotes] = await Promise.all([
    api.multiCall({ target: FACTORY, abi: abi.tokenCurves, calls: tokens }),
    api.multiCall({ target: FACTORY, abi: abi.tokenQuotes, calls: tokens }),
  ])
  const tokensAndOwners = curves.map((curve, i) => [quotes[i], curve])

  if (await api.getBlock() >= ACCOUNT_FACTORY_BLOCK) {
    const counts = await api.multiCall({ target: ACCOUNT_FACTORY, abi: abi.accountCount, calls: tokens })
    const calls = []
    const accountQuotes = []
    counts.forEach((count, i) => {
      for (let j = 0; j < Number(count); j++) {
        calls.push({ params: [tokens[i], j] })
        accountQuotes.push(quotes[i])
      }
    })
    const accounts = await api.multiCall({ target: ACCOUNT_FACTORY, abi: abi.accountAt, calls })
    accounts.forEach((account, i) => tokensAndOwners.push([accountQuotes[i], account]))
  }

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: 'TVL is the quote currency (ETH or an approved ERC20) held by the bonding curve of every token launched through the Tsunami factory on Ink, plus the quote creators deposit into their Riptide agent accounts, which only the creator can withdraw. A curve that graduates forwards its raise into a Calamari v4 pool, so it stops being counted here. The Riptide vault trades platform capital and is not counted.',
  start: '2026-08-31',
  ink: { tvl },
}
