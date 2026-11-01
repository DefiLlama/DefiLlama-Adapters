const ADDRESSES = require('../helper/coreAssets.json')
const { formatUnits } = require('ethers')

// Settlement history and position tokens: app.stryke.xyz's public ABI/config and
// api.rfq.stryke.xyz/indexer/portfolio. Only the new RFQ product is included.
const robinhoodOwners = [
  '0x1fa225166e84cade8fb74384622dbdf6cfe55929',
  '0x98d43a79815e034e480537c23ea6cef7dfcb9d29',
  '0xc53a4248c8d7eab225a921f7d70249375e2132cf', // Original position token from requests(maker,nonce).
  '0x9387490e2572bd4ab10aeba7ad45e148803f5d75',
  '0xa84548bb2e28ae9279574973171b4f9d47b0669b',
  '0x334d303aa7da47289df4111ffd6cef7512631347',
  '0x6f1285fd060259e535c8e7526009d5c6ae247024',
  '0xf42e8db59f916749cd323fdf84adb34bf571634d',
  '0xe79b0aceb21aa1362d2f5f6f5bbfe8882cf2937a',
  '0x3f088bf19f6d04b1fa84ce3bbcf95365f839e110',
  '0x04fab9f0d0f18a8b88bc69b94fdd3d9132318bb9',
  '0x2913ba15456e0fc2007e565b33096ca083ed92e3',
]
const stakedSyk = '0x20b2431557bB90954744a6D404f45aD1aD8719f4'

async function staking(api) {
  // Source: github.com/stryke-xyz/lumbridge/blob/master/src/governance/StakedSYK.sol
  // Count active + cooling-down principal, not reward reserves or admin penalties.
  const token = await api.call({ target: stakedSyk, abi: 'address:syk' })
  const active = await api.call({ target: stakedSyk, abi: 'uint256:totalSupply' })
  const pending = await api.call({ target: stakedSyk, abi: 'uint256:totalPendingUnstake' })
  // Official SYK migration: docs.stryke.xyz/tokenomics/syk-token.
  // Llama has a coingecko:stryke price but no Robinhood token-price mapping yet.
  if (token.toLowerCase() !== '0x97c065eed0309f182777bffa41a9c0027c190df1')
    throw new Error('StakedSYK underlying changed; review pricing mapping')
  const decimals = await api.call({ target: token, abi: 'erc20:decimals' })
  api.addCGToken('stryke', Number(formatUnits(BigInt(active) + BigInt(pending), Number(decimals))))
  return api.getBalances()
}

module.exports = {
  methodology: 'Cash balances in the identified RFQ settlement escrow, option-position and funded-payout contracts. Excludes trader wallets, bridge balances, market-maker external hedges, fee treasury and notional option exposure. Staking separately counts active and cooling-down SYK principal, excluding rewards and penalties. This measures on-chain RFQ custody, not off-chain collateral or legacy CLAMM TVL.',
  robinhood: {
    start: '2026-10-04',
    tvl: api => api.sumTokens({ owners: robinhoodOwners, tokens: [ADDRESSES.robinhood.USDG] }),
    // StakedSYK was deployed October 8; earlier history has no stake.
    staking: api => api.timestamp < 1791469511 ? {} : staking(api),
  },
  arbitrum: {
    start: '2026-10-30',
    tvl: api => api.sumTokens({ owners: ['0x6f1285fd060259e535c8e7526009d5c6ae247024', '0x04fab9f0d0f18a8b88bc69b94fdd3d9132318bb9', '0x2913ba15456e0fc2007e565b33096ca083ed92e3'], tokens: [ADDRESSES.arbitrum.USDC] }),
  },
}
