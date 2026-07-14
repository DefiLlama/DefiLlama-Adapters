const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

// Apyee — non-custodial multi-chain USDC yield aggregator.
// Immutable ERC-4626 Vaults deposit USDC into whitelisted DeFi strategies
// (Aave V3, Compound V3, Morpho MetaMorpho, Fluid, Venus, Spark).
// Prod deployment: v2.1.3 (2026-07-13). Owner = Gnosis Safe multi-sig 2/3.
// Audited by Soken (4 reports, final PASS 91/100). Source verified on each explorer.
// https://apyee.com/security
const vaults = {
  ethereum: ['0xE46aac58214B963125a3A88541e1DBE56c4eD5f7'],
  base: [
    '0xeA8FB89F44A1fa47E52354D44E7e6D4682C8529a', // balanced
    '0x87922c630A980e431fb045A178e53F58d3f07F85', // aggressive
  ],
  arbitrum: ['0x94f89d1E2825d40627CD2aE24Eba8590F675049C'],
  bsc: ['0x27DB5a2B203D6bd3C9490E8EA4488B968675f5Bf'],
}

module.exports = Object.fromEntries(
  Object.entries(vaults).map(([chain, addrs]) => [
    chain,
    { tvl: sumERC4626VaultsExport2({ vaults: addrs }) },
  ])
)

module.exports.methodology =
  'Sum of totalAssets() reported by each Apyee VaultV2 across supported chains — includes idle USDC plus assets currently deployed into whitelisted DeFi lending strategies (Aave V3, Compound V3, Morpho MetaMorpho, Fluid, Venus, Spark). USDC decimals differ per chain (6 on Ethereum/Base/Arbitrum, 18 on BNB Chain); the helper resolves this via asset().decimals().'

module.exports.doublecounted = true
module.exports.start = '2026-07-13'
