const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// RavenhoodVault — permanently locked, protocol-owned RVH/WETH Uniswap V3 position
const VAULT = '0x5e1485137E025bf7774F52DE4E33fa6E498f6ede'
const UNISWAP_V3_NFT_MANAGER = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const RVH_TOKEN = '0x96765066f6a040a21EB027167D2315B707c82633'

module.exports = {
  robinhood: {
    tvl: sumTokensExport({ owner: VAULT, resolveUniV3: true, uniV3ExtraConfig: { nftAddress: UNISWAP_V3_NFT_MANAGER }, blacklistedTokens: [RVH_TOKEN] }),
    ownTokens: sumTokensExport({ owner: VAULT, resolveUniV3: true, uniV3ExtraConfig: { nftAddress: UNISWAP_V3_NFT_MANAGER }, blacklistedTokens: [ADDRESSES.robinhood.WETH] }),
  },
}
