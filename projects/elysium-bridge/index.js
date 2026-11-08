const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Elysium is Kinetiq's Arbitrum Orbit chain, settling to HyperEVM. Its canonical bridge escrows
// deposits on HyperEVM: native HYPE in the rollup's Bridge contract and ERC-20s in the
// standard ERC20 gateway behind the gateway router.
const BRIDGE = '0x503D572157113fAaaD4DbeD2647Bb10b949216B6'
const ERC20_GATEWAY = '0xd97B30dE0bA0C2eAeE942afce77530e06c5F122c'

// HyperEVM tokens with a representation on Elysium
const tokens = [
  ADDRESSES.null, // HYPE
  ADDRESSES.hyperliquid.WHYPE,
  '0xfD739d4e423301CE9385c1fb8850539D657C296D', // kHYPE
  '0x360C140E5344A1A0593D44B4ea6Fc7C3DAf0C473', // kmHYPE
  '0x9BA2EDc44E0A4632EB4723E81d4142353e1bB160', // vkHYPE
  '0x000000000000780555bD0BCA3791f89f9542c2d6', // KNTQ
  '0x696238e0Ca31c94e24ca4CBe7921754E172E4d0F', // sKNTQ
  ADDRESSES.hyperliquid.USDC,
  ADDRESSES.hyperliquid.USDT0,
  ADDRESSES.hyperliquid.USDe,
  '0x111111a1a0667d36bD57c0A9f569b98057111111', // USDH
  '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463', // UBTC
  '0xBe6727B535545C67d5cAa73dEa54865B92CF7907', // UETH
  '0x068f321Fa8Fb9f0D135f290Ef6a3e2813e1c8A29', // USOL
  '0x9b498C3c8A0b8CD8BA1D9851d40D186F1872b44E', // PURR
  '0x62D5dD0190376c444a4B2E2e860aa392eC83Ed80', // JOFF
  '0x07c57E32a3C29D5659bda1d3EFC2E7BF004E3035', // NEST
]

module.exports = {
  methodology: 'Counts HYPE and ERC-20 tokens locked on HyperEVM in the Elysium canonical bridge: native HYPE in the rollup Bridge contract and tokens in its ERC20 gateway.',
  hyperliquid: {
    tvl: sumTokensExport({ owners: [BRIDGE, ERC20_GATEWAY], tokens }),
  },
}
