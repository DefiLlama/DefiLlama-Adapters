const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

/*
  HyperHAM (HAM Protocol) — HyperEVM (chain key `hyperliquid`)

  HAM is a rebasing ERC-20 backed by a HYPE-denominated reserve held in the protocol
  multisig. The protocol's measurable value is that reserve, so TVL is measured the way
  Olympus's is (projects/olympus): assets held by the treasury, excluding the protocol's
  own token and the own-token side of protocol-owned liquidity.

  tvl        Reserve assets the multisig holds: WHYPE, native HYPE, and the WHYPE side of
             protocol-owned Ramses liquidity. The LP is unwrapped and its wHAM side is
             blacklisted out of this bucket — it is protocol inventory, not a reserve.
             Both assets in this bucket are core assets, so tvl does not depend on wHAM
             having a price feed.
  ownTokens  HAM and wHAM held by the multisig, plus the wHAM leg of protocol-owned
             liquidity. Protocol inventory, reported separately so it is never counted as
             backing for itself. The LP has two legs and both are treasury-owned — counting
             only the WHYPE one would drop real inventory from the report.
  borrowed   WHYPE lent by the Cooler desk and still outstanding. Those tokens have left
             the multisig and sit with borrowers, so they are reported here instead of in
             tvl — the same treatment Olympus gives Cooler Loans debt.
*/

const TREASURY = '0xF61D218b1429243d7F5937bCB85A4B8b41301CCa'
const HAM = '0xd62DcC1E28D646Db54E2204A40980F9db28e0363'
const WHAM = '0xD48ad2f34Ce9071ac130F55237c030643C5eeDe6'
const RAMSES_WHYPE_WHAM = '0x6cCA1C5a88A391f4e55f69E7BBA13e42A813BaD5'
const COOLER_VAULT = '0x4B184A9f7DE61A3254B35Bb2F0295D68B0C3221e'

const WHYPE = ADDRESSES.hyperliquid.WHYPE
const OWN_TOKENS = [HAM, WHAM]

// The protocol-owned Ramses position is a Solidly-style pair whose symbol
// ("Volatile - WHYPE/wHAM") does not match the repo's isLP heuristic, so `resolveLP` leaves
// it as an unpriced LP token. It is unwrapped explicitly here instead. Both legs are
// returned and each goes to the bucket it belongs in: WHYPE to tvl, wHAM to ownTokens.
const getProtocolOwnedLiquidity = async (api) => {
  const [balance, supply, reserves, token0] = await Promise.all([
    api.call({ target: RAMSES_WHYPE_WHAM, abi: 'erc20:balanceOf', params: [TREASURY] }),
    api.call({ target: RAMSES_WHYPE_WHAM, abi: 'uint256:totalSupply' }),
    api.call({ target: RAMSES_WHYPE_WHAM, abi: 'function getReserves() view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)' }),
    api.call({ target: RAMSES_WHYPE_WHAM, abi: 'address:token0' }),
  ])
  if (!+supply || !+balance) return null
  const isToken0 = token0.toLowerCase() === WHYPE.toLowerCase()
  const share = (reserve) => (BigInt(reserve) * BigInt(balance)) / BigInt(supply)
  return {
    whype: share(isToken0 ? reserves.reserve0 : reserves.reserve1),
    wham: share(isToken0 ? reserves.reserve1 : reserves.reserve0),
  }
}

const tvl = async (api) => {
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens: [WHYPE, ADDRESSES.null],
    blacklistedTokens: OWN_TOKENS,
  })
  const pol = await getProtocolOwnedLiquidity(api)
  // Lowercase: sumTokens2 writes lowercased keys, and api.add does not normalize — a
  // checksummed address here would create a second balance entry for the same token.
  if (pol) api.add(WHYPE.toLowerCase(), pol.whype)
}

const ownTokens = async (api) => {
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens: OWN_TOKENS,
  })
  const pol = await getProtocolOwnedLiquidity(api)
  if (pol) api.add(WHAM.toLowerCase(), pol.wham)
}

const borrowed = async (api) => {
  const receivables = await api.call({ target: COOLER_VAULT, abi: 'uint256:reserveReceivables' })
  api.add(WHYPE, receivables)
}

module.exports = {
  start: '2026-06-13',
  methodology:
    'TVL is the reserve held by the HAM treasury multisig: WHYPE, native HYPE, and the WHYPE side of protocol-owned Ramses liquidity. HAM and wHAM held by the multisig are protocol inventory and are reported under ownTokens rather than TVL, so the token is never counted as its own backing. WHYPE lent out by the Cooler desk and still outstanding is reported under borrowed.',
  hallmarks: [
    ['2026-06-13', 'Mainnet launch'],
    ['2026-08-10', 'Liquidity migrated to Ramses (wHAM/WHYPE)'],
  ],
  hyperliquid: {
    tvl,
    ownTokens,
    borrowed,
  },
}
