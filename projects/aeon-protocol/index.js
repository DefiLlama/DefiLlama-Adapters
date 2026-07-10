const { sumTokens2 } = require('../helper/unwrapLPs')
const { joeV2Export } = require('../helper/traderJoeV2')

// AeonFactoryRH — the original constant-product (vAMM) pool factory. Not a
// standard UniswapV2Factory: pools are exposed via a public `allPools` array
// + `allPoolsLength()` instead of `allPairs`/`allPairsLength`. Kept for TVL
// purposes since some already-created pools (now dust) still live here.
const AEON_FACTORY = '0xD8495E398Fd7F0293Ccfca4a16181216CfDa6ED6'

// 2026-07-09: fresh factory (same allPools/allPoolsLength interface) that
// all new pool creation targets exclusively going forward — verified
// on-chain (allPoolsLength()==9 as of this writing, covering every pool
// pair added since). Enumerating this dynamically means newly-created pools
// are picked up automatically without editing this file again.
const AEON_FACTORY_V2 = '0xE27EA15dF9e69ce06aB8ee5a2029BD699f9cF9fC'

// 2026-07-03: migrated off the 3 genesis vAMM pools (their pool contract had
// no way to ever claim swap fees, and was immutable, so it couldn't be
// patched — replaced with fresh pools instead). These 3 were deployed
// directly rather than via a factory's createPool() (both factories only
// allow one pool per token-pair/fee-tier and already had one on record for
// each of these three) — so they're NOT discoverable via either factory's
// allPools()/allPoolsLength() below, and need listing explicitly here.
const NEW_VAMM_POOLS = [
  { pool: '0xD215650cb628113A64D938164Ee5CD72293F9ea6', token0: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', token1: '0xd4c93eD1843606f92CccA078941f3d52A585982f' }, // AEON/ETH
  { pool: '0x38be0a822326D51fdF37a9b44Cb6dcA49A59E288', token0: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', token1: '0xd4c93eD1843606f92CccA078941f3d52A585982f' }, // AEON/USDG
  { pool: '0x2732E1312e5Bba5729534E9d94D44c090b200F14', token0: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', token1: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168' }, // ETH/USDG
]

// Algebra Integral (algebra.finance) concentrated-liquidity pools — a fixed,
// small set (no enumerable factory getter is used for these), each holding
// its own token balances directly regardless of tick range. 4 original
// (2026-07-03) + 7 more added 2026-07-09 for the remaining vAMM pairs.
const CL_POOLS = [
  '0x3c8090c3Cb3A45A677A6492acb5ad5253F9A686e', // AEON/ETH
  '0xE2503a27a33DacdBEEc821557fe8747800Cf6ff6', // AEON/USDG
  '0x96B5de75c08971f41DE6bde917fB0a8d0EB450F3', // ETH/USDG
  '0x280b2eb06B105944BB2f1378c861D604eb82Aa3d', // VIRTUAL/AEON
  '0xC4A0B77a4a09eE7ECff12CC6504BFA9BB8c62C3B', // ROBINFUN/AEON
  '0xbCD1Bf0d9F25503DDfEd0b663827811637B27B80', // CASHCAT/AEON
  '0x9ebd1C556967d8e3f6f1C043D57eb7762047D60D', // CASHCAT/USDG
  '0x09e729D9e077EB1Ad10aDccDE4D18C143035fe04', // CASHCAT/ETH
  '0x14E266508d68107509487DE6Ead5ded5764C5F20', // CASHCAT/ROBINFUN
  '0xC6b5b34133E290e5c28B19844970cee783DD9b40', // ROBINFUN/ETH
  '0xBb6aA9914f53afb8e7C89Bf05D4DD2525aF4E4ce', // ROBINFUN/USDG
]
const CL_TOKENS = [
  '0xd4c93eD1843606f92CccA078941f3d52A585982f', // AEON
  '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  '0xc6911796042b15d7Fa4F6CDe69e245DdCd3d9c31', // VIRTUAL (real Virtuals Protocol token, not issued by AEON)
  '0x56A98Db16Cf501b686c14BA00a5DeC02E87083FA', // ROBINFUN (real, independently-deployed token, not issued by AEON)
  '0x020bfC650A365f8BB26819deAAbF3E21291018b4', // CASHCAT (real, independently-deployed token, not issued by AEON)
]

// Trader Joe / LFJ Liquidity Book (DLMM) — enumerated directly from its own
// factory via the shared joeV2Export helper. Our factory exposes the v1-style
// getLBPairAtIndex/getNumberOfLBPairs/getTokenX/getTokenY (verified on-chain:
// allLBPairs()/tokenX() both revert, getLBPairAtIndex()/getTokenX() don't) --
// isLb:true selects the wrong ABI variant (allLBPairs/tokenX) and fails every
// call, so it's deliberately omitted here to use the default v1 ABI instead.
const DLMM_FACTORY = '0xd60Cf7876a1E7B8fcf963722A05039849fde5387'
const dlmm = joeV2Export({ robinhood: { factory: DLMM_FACTORY } })

module.exports = {
  methodology: 'Counts tokens held directly by AEON Protocol pool contracts on Robinhood Chain across its three pool types: constant-product (vAMM) pools (enumerated from both the original and current AeonFactoryRH factories, plus a fixed set of pools migrated outside the factory, listed explicitly), Algebra Integral concentrated-liquidity (CL) pools, and Trader Joe/LFJ Liquidity Book (DLMM) pools enumerated from their factory.',
  robinhood: {
    tvl: async (api) => {
      // vAMM — dynamic (factory-enumerated) pools, both factories
      const pools = await api.fetchList({
        target: AEON_FACTORY,
        itemAbi: 'function allPools(uint256) view returns (address)',
        lengthAbi: 'uint256:allPoolsLength',
      })
      const poolsV2 = await api.fetchList({
        target: AEON_FACTORY_V2,
        itemAbi: 'function allPools(uint256) view returns (address)',
        lengthAbi: 'uint256:allPoolsLength',
      })
      const allFactoryPools = [...pools, ...poolsV2]
      const token0s = await api.multiCall({ abi: 'address:token0', calls: allFactoryPools })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: allFactoryPools })
      const vammTokensAndOwners = []
      allFactoryPools.forEach((pool, i) => {
        vammTokensAndOwners.push([token0s[i], pool])
        vammTokensAndOwners.push([token1s[i], pool])
      })

      // vAMM — pools deployed directly outside the factory (see NEW_VAMM_POOLS above)
      for (const p of NEW_VAMM_POOLS) {
        vammTokensAndOwners.push([p.token0, p.pool])
        vammTokensAndOwners.push([p.token1, p.pool])
      }

      // permitFailure: true on both calls below -- a couple of the vAMM pools
      // enumerated via the factory are pre-migration dust (see NEW_VAMM_POOLS
      // comment above) and could revert or return stale data; without this,
      // one bad pool/token call would zero out the whole adapter's TVL
      // instead of just excluding that pool.
      await sumTokens2({ api, tokensAndOwners: vammTokensAndOwners, permitFailure: true })

      // Algebra CL
      await sumTokens2({ api, owners: CL_POOLS, tokens: CL_TOKENS, permitFailure: true })

      // DLMM
      await dlmm.robinhood.tvl(api)
    },
  },
}
