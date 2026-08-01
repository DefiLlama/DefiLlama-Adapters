/**
 * MerryForge TVL adapter for DefiLlama (DefiLlama-Adapters).
 *
 * Source of truth for protocol addresses
 *
 * DefiLlama TVL:
 *   - Quote inventory on bonding curves (TVL-C)
 *   - Permanently locked official UniV2 LP via LiquidityLocker (TVL-G)
 *   - USDG in CreatorBondVault
 *   - Known quote balances in FeeVault
 *   - USDG in protocolTreasury only when it is a contract (not an EOA)
 *
 * Excludes: launch-token inventory, secondary pools, EOA treasury wallets.
 */


const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

// --- Robinhood Chain mainnet (4663) ---
const LAUNCH_FACTORY = '0x3b5e8FE8d61B00b35e021275c96F754424b1B9A8'
const GRADUATION_ROUTER = '0x2a8F21ACa57873479CB0E73cd7D0dB22274B51A8'
const LIQUIDITY_LOCKER = '0xe376C24bB0351ff95Aa3fd76f967870Fa9eD82A4'
const BOND_VAULT = '0x889C3071CF406a1977e0Fb5A076fd893ed918f9D'
const FEE_VAULT = '0x8963d65670838ac4b728A049416BDEc89d6cC776'

/** Factory deploy block (MerryForgeLaunchFactory creation). */
const START_BLOCK = 24875635

const ZERO = '0x0000000000000000000000000000000000000000'

const USDG = ADDRESSES.robinhood.USDG
const WETH = ADDRESSES.robinhood.WETH

/** VIRTUAL raise asset (ops preset). */
const VIRTUAL = '0xc6911796042b15d7Fa4F6CDe69e245DdCd3d9c31'

/**
 * First-wave Stock Token native-raise quotes
 */
const STOCK_NATIVE_RAISE = [
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0xe93237C50D904957Cf27E7B1133b510C669c2e74', // MSFT
]

/** All known raise / fee quote assets. */
const QUOTES = [USDG, WETH, VIRTUAL, ...STOCK_NATIVE_RAISE]

async function isContract(address, chain) {
  if (!address || address === ZERO) return false
  try {
    const code = await sdk.api.eth.getCode({ target: address, chain })
    return !!(code && code !== '0x' && code !== '0x0')
  } catch {
    // Fail closed: do not count unknown treasury as TVL
    return false
  }
}

async function tvl(api) {
  const chain = api.chain
  const quoteOwners = [FEE_VAULT]
  const pools = []

  const count = Number(
    await api.call({ target: LAUNCH_FACTORY, abi: 'uint256:launchCount' }),
  )

  if (count > 0) {
    const ids = Array.from({ length: count }, (_, i) => i + 1)

    const curves = await api.multiCall({
      target: LAUNCH_FACTORY,
      abi: 'function launchCurve(uint256) view returns (address)',
      calls: ids,
    })
    quoteOwners.push(...curves.filter((c) => c && c !== ZERO))

    const tokens = await api.multiCall({
      target: LAUNCH_FACTORY,
      abi: 'function launchToken(uint256) view returns (address)',
      calls: ids,
    })

    const poolAddrs = await api.multiCall({
      target: GRADUATION_ROUTER,
      abi: 'function poolForToken(address) view returns (address)',
      calls: tokens,
      permitFailure: true,
    })
    for (const p of poolAddrs) {
      if (p && p !== ZERO) pools.push(p)
    }
  }

  // Curves + FeeVault: known raise quotes
  await sumTokens2({ api, owners: quoteOwners, tokens: QUOTES })

  // Creator bonds: USDG only
  await sumTokens2({ api, owner: BOND_VAULT, tokens: [USDG] })

  // Graduated locked LP (100% of official mint → locker)
  if (pools.length) {
    await sumTokens2({
      api,
      owner: LIQUIDITY_LOCKER,
      tokens: pools,
      resolveLP: true,
    })
  }

  // Create-fee treasury: USDG only when treasury is a contract (Safe/multisig)
  const treasury = await api.call({
    target: LAUNCH_FACTORY,
    abi: 'address:protocolTreasury',
  })
  if (await isContract(treasury, chain)) {
    await sumTokens2({ api, owner: treasury, tokens: [USDG] })
  }

  return api.getBalances()
}

module.exports = {
  methodology:
    'MerryForge TVL is raise-asset inventory in bonding curves, permanently locked official UniV2 LP (LiquidityLocker), USDG in CreatorBondVault, known quote balances in FeeVault, and USDG in protocolTreasury when that address is a contract (EOA treasury is skipped). Excludes launch-token inventory and secondary pools.',
  start: START_BLOCK,
  robinhood: { tvl },
}
