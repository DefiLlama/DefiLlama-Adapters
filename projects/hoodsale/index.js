const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// HoodSale, the presale launchpad on Robinhood Chain. Two on-chain sources of locked value:
// the ETH a running sale escrows for its contributors, and the LP a finished sale locked.
const PRESALE_FACTORY = '0x8dcC19e98713C2EC024dd337Edea18BEBC490942'
const LIQUIDITY_LOCKER = '0xfF7E28d54f1927565Ab02781b635178b9b2683B7'

const abi = {
  allPresales: 'function allPresales(uint256) view returns (address)',
  allPresalesLength: 'uint256:allPresalesLength',
  lockCount: 'uint256:lockCount',
  locks: 'function locks(uint256) view returns (address token, address owner, uint256 amount, uint64 unlockTime, bool withdrawn)',
}

async function tvl(api) {
  // Every sale the factory ever created. A sale holds its contributions as native ETH until it
  // launches or refunds, so its balance is the escrow; a settled sale simply holds nothing.
  const presales = await api.fetchList({
    lengthAbi: abi.allPresalesLength,
    itemAbi: abi.allPresales,
    target: PRESALE_FACTORY,
  })

  // LP locked by a sale that chose Lock over Burn. Balances are read from the locker itself, so
  // a lock that has been withdrawn drops out on its own; the list only supplies the token set.
  const locks = await api.fetchList({
    lengthAbi: abi.lockCount,
    itemAbi: abi.locks,
    target: LIQUIDITY_LOCKER,
  })
  const lockedTokens = [...new Set(locks.map(i => i.token))]

  const ownerTokens = presales.map(presale => [[ADDRESSES.null], presale])
  if (lockedTokens.length) ownerTokens.push([lockedTokens, LIQUIDITY_LOCKER])

  return sumTokens2({ api, ownerTokens, resolveLP: true })
}

module.exports = {
  methodology:
    'ETH escrowed in HoodSale presale contracts while a sale is running (contributions are held by the sale until it launches or refunds), plus the liquidity locked in the HoodSale LiquidityLocker by sales that chose to lock their LP instead of burning it, unwrapped to its underlying tokens. Locked LP also sits in the DEX pools tracked separately, so it is marked as double counted. Platform revenue held by the Treasury is not counted.',
  doublecounted: true,
  start: '2026-09-04',
  robinhood: { tvl },
}
