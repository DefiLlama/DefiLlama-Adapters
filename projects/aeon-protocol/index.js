const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { getUniTVL } = require('../helper/unknownTokens')
const { joeV2Export } = require('../helper/traderJoeV2')

const AEON_FACTORY = '0xD8495E398Fd7F0293Ccfca4a16181216CfDa6ED6'
const DLMM_FACTORY = '0xd60Cf7876a1E7B8fcf963722A05039849fde5387'

// New pools were deployed without factory so they're not discoverable via allPools()/allPoolsLength()
const NEW_VAMM_POOLS = [
  { pool: '0xD215650cb628113A64D938164Ee5CD72293F9ea6', token0: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', token1: '0xd4c93eD1843606f92CccA078941f3d52A585982f' }, // AEON/ETH
  { pool: '0x38be0a822326D51fdF37a9b44Cb6dcA49A59E288', token0: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', token1: '0xd4c93eD1843606f92CccA078941f3d52A585982f' }, // AEON/USDG
  { pool: '0x2732E1312e5Bba5729534E9d94D44c090b200F14', token0: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', token1: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168' }, // ETH/USDG
]
const NEW_VAMM_TOKENS_AND_OWNERS = NEW_VAMM_POOLS.flatMap(p => [[p.token0, p.pool], [p.token1, p.pool]])

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

const vammFactoryTvl = getUniTVL({
  factory: AEON_FACTORY,
  fetchBalances: true,
  abis: {
    allPairs: 'function allPools(uint256) view returns (address)',
    allPairsLength: 'uint256:allPoolsLength',
  },
})

// off-factory vAMM pools + Algebra Integral concentrated-liquidity pools
const staticPoolsTvl = sumTokensExport({ owners: CL_POOLS, tokens: CL_TOKENS, tokensAndOwners: NEW_VAMM_TOKENS_AND_OWNERS })

const dlmm = joeV2Export({ robinhood: { factory: DLMM_FACTORY } })
const dlmmTvl = async (api) => { await dlmm.robinhood.tvl(api); return api.getBalances() }

module.exports = {
  methodology: 'Counts tokens held directly by AEON Protocol pool contracts on Robinhood Chain across its three pool types: constant-product (vAMM) pools (enumerated from AeonFactoryRH plus a fixed set of pools migrated after the factory, listed explicitly), Algebra Integral concentrated-liquidity (CL) pools, and Trader Joe/LFJ Liquidity Book (DLMM) pools enumerated from their factory.',
  robinhood: {
    tvl: sdk.util.sumChainTvls([vammFactoryTvl, staticPoolsTvl, dlmmTvl]),
  },
}
