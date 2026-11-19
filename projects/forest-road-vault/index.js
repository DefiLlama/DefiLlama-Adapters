const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// USDfr is minted 1:1 against USDC. ReserveManager custodies that USDC and records the
// principal it has released to credit facilities. Curator first-loss capital (CuratorModule),
// the sGROVE coverage reserve and sUSDfr all hold USDfr, so they are claims on this same
// reserve and are not counted again.
const RESERVE_MANAGER = '0x8317736611B542DDb4A820fE344b621A904BdD48'

async function tvl(api) {
  return sumTokens2({ api, owner: RESERVE_MANAGER, tokens: [ADDRESSES.ethereum.USDC] })
}

async function borrowed(api) {
  // Both values are 18-decimal USDfr value; USDC uses 6 decimals.
  const principal = await api.call({ target: RESERVE_MANAGER, abi: 'uint256:deployedPrincipal' })
  const impairment = await api.call({ target: RESERVE_MANAGER, abi: 'uint256:totalPrincipalImpairment' })
  const net = BigInt(principal) - BigInt(impairment)
  if (net > 0n) api.add(ADDRESSES.ethereum.USDC, (net / 10n ** 12n).toString())
}

module.exports = {
  methodology: 'TVL is the USDC held by the ReserveManager, the reserve that backs USDfr. Borrowed is the principal deployed to credit facilities, net of recognized impairments, as recorded on chain by the ReserveManager. USDfr held by sUSDfr, curator first-loss pools and the sGROVE coverage reserve is a claim on the same reserve and is not counted again.',
  start: '2026-09-19', // ReserveManager deployed at block 26006832 (2026-09-18 20:38 UTC)
  ethereum: { tvl, borrowed },
}
