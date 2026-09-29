const { nullAddress } = require('../helper/unwrapLPs')

const TREASURY_V1 = '0xc7220C3004662ef3942aef43452893086b9D6fB5'
const TREASURY_V2 = '0x8dD84F1901BD74A4D137f0f6a5A3A90E686AAB1D'
const SFRXETH = '0x00000000883279097A49dB1f2af954EAd0C77E3c'

// Deployment of treasury v2 on 2026-09-23. The v2 reads revert before it.
const V2_START = 1790135441

// v1 holds native ETH, v2 holds sfrxETH. A holder burns $UFG for a share of both.
async function tvl(api) {
  await api.sumTokens({ owner: TREASURY_V1, tokens: [nullAddress] })
  if (api.timestamp < V2_START) return
  return api.sumTokens({ owner: TREASURY_V2, tokens: [SFRXETH] })
}

// v2 lends sfrxETH against $UFG collateral. Loans count at principal, as in the contract.
async function borrowed(api) {
  if (api.timestamp < V2_START) return
  const principal = await api.call({ abi: 'uint256:principalOutstanding', target: TREASURY_V2 })
  api.add(SFRXETH, principal)
}

module.exports = {
  methodology:
    'TVL is the native ETH held by UFG treasury v1 and the sfrxETH held by UFG treasury v2 on Robinhood Chain. Holders of $UFG can burn the token to redeem a pro-rata share of both treasuries. Borrowed is the sfrxETH principal that treasury v2 has lent against $UFG collateral.',
  start: '2026-08-30',
  robinhood: { tvl, borrowed },
}
