const { sumTokens2 } = require('../helper/unwrapLPs')
const { joeV2Export } = require('../helper/traderJoeV2')

// AeonFactoryRH — the constant-product (vAMM) pool factory. Not a standard
// UniswapV2Factory: pools are exposed via a public `allPools` array +
// `allPoolsLength()` instead of `allPairs`/`allPairsLength`.
const AEON_FACTORY = '0xD8495E398Fd7F0293Ccfca4a16181216CfDa6ED6'

// Algebra Integral (algebra.finance) concentrated-liquidity pools — a fixed,
// small set (no enumerable factory getter is used for these), each holding
// its own token balances directly regardless of tick range.
const CL_POOLS = [
  '0x3c8090c3Cb3A45A677A6492acb5ad5253F9A686e', // AEON/ETH
  '0xE2503a27a33DacdBEEc821557fe8747800Cf6ff6', // AEON/USDG
  '0x96B5de75c08971f41DE6bde917fB0a8d0EB450F3', // ETH/USDG
  '0x280b2eb06B105944BB2f1378c861D604eb82Aa3d', // VIRTUAL/AEON
]
const CL_TOKENS = [
  '0xd4c93eD1843606f92CccA078941f3d52A585982f', // AEON
  '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  '0xc6911796042b15d7Fa4F6CDe69e245DdCd3d9c31', // VIRTUAL (real Virtuals Protocol token, not issued by AEON)
]

// Trader Joe / LFJ Liquidity Book (DLMM) — enumerated directly from its own
// factory via the shared joeV2Export helper.
const DLMM_FACTORY = '0xd60Cf7876a1E7B8fcf963722A05039849fde5387'
const dlmm = joeV2Export({ robinhood: { factory: DLMM_FACTORY, isLb: true } })

module.exports = {
  methodology: 'Counts tokens held directly by AEON Protocol pool contracts on Robinhood Chain across its three pool types: constant-product (vAMM) pools enumerated from AeonFactoryRH, Algebra Integral concentrated-liquidity (CL) pools, and Trader Joe/LFJ Liquidity Book (DLMM) pools enumerated from their factory.',
  robinhood: {
    tvl: async (api) => {
      // vAMM
      const pools = await api.fetchList({
        target: AEON_FACTORY,
        itemAbi: 'function allPools(uint256) view returns (address)',
        lengthAbi: 'uint256:allPoolsLength',
      })
      const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
      const vammTokensAndOwners = []
      pools.forEach((pool, i) => {
        vammTokensAndOwners.push([token0s[i], pool])
        vammTokensAndOwners.push([token1s[i], pool])
      })
      await sumTokens2({ api, tokensAndOwners: vammTokensAndOwners })

      // Algebra CL
      await sumTokens2({ api, owners: CL_POOLS, tokens: CL_TOKENS })

      // DLMM
      await dlmm.robinhood.tvl(api)
    },
  },
}
