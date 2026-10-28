const ADDRESSES = require('../helper/coreAssets.json')

const FACTORY = '0xa0fbee2787355f988ebd93efc982fa31a904c45f'
const USDG = ADDRESSES.robinhood.USDG

async function tvl(api) {
  // Only the fixed, static address[13] prefix of CoinRecord is needed.
  const coins = await api.fetchList({
    target: FACTORY,
    lengthAbi: 'uint256:coinCount',
    itemAbi: 'function coin(uint256) view returns (address[13])',
  })
  if (!coins.length) return

  const treasuries = coins.map(coin => coin[1])
  const owners = coins.flatMap(coin => [coin[1], coin[2], coin[3]])
  await api.sumTokens({ tokens: [USDG], owners })

  // morphoAssets is attributed active + recovery vault value in 18-decimal USDG, without the RFV haircut.
  const morphoAssets = await api.multiCall({ abi: 'uint256:morphoAssets', calls: treasuries })
  for (const assets of morphoAssets) api.add(USDG, (BigInt(assets) / 10n ** 12n).toString())
}

module.exports = {
  start: '2026-10-28',
  doublecounted: true, // Treasury ERC-4626 deposits are also counted by Morpho.
  methodology: 'Counts USDG held by each production factory coin\'s Genesis sale (including funds awaiting refunds), Treasury and stock reserve, plus the underlying USDG value of the Treasury\'s attributed active and recovery Morpho shares. No RFV haircut is applied. Excludes launched tokens, tokenized stocks, unclaimed rewards, fee recipients and DEX-held protocol-owned liquidity. Recovery vault value follows the on-chain morphoAssets() getter, which returns zero for an unreadable recovery position. Morpho positions overlap with Morpho TVL.',
  robinhood: { tvl },
}
