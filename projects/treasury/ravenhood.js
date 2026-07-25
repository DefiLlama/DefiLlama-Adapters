const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// RavenhoodVault — permanently locked, protocol-owned RVH/WETH Uniswap V3 position
const VAULT = '0x5e1485137E025bf7774F52DE4E33fa6E498f6ede'
const UNISWAP_V3_NFT_MANAGER = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
// DAO treasury wallet — interim EOA (moving to a multisig). Holds plain
// USDG/ETH plus DAO-owned Uniswap V3 LP positions pairing RVH against
// tokenized stocks/blue chips (the "expansion liquidity" the burn engine
// funds) -- resolveUniV3 auto-discovers all of them, not just one pair.
const DAO_WALLET = '0x097ba31b7ACfFd75B909fc7BEf2e55424d2dAcdc'
const RVH_TOKEN = '0x96765066f6a040a21EB027167D2315B707c82633'

module.exports = {
  robinhood: {
    tvl: sumTokensExport({
      owners: [VAULT, DAO_WALLET],
      tokens: [ADDRESSES.robinhood.USDG, ADDRESSES.null],
      resolveUniV3: true,
      uniV3ExtraConfig: { nftAddress: UNISWAP_V3_NFT_MANAGER },
      blacklistedTokens: [RVH_TOKEN],
    }),
    // uniV3WhitelistedTokens (not blacklistedTokens) is required here: the DAO
    // wallet's LP positions pair RVH against many different tokens (WETH,
    // VIRTUAL, MSFT, TSLA, AAPL, NVDA, SPY, PLTR, GOOGL, ...), so blacklisting
    // just one quote token leaks all the others into "ownTokens". Whitelisting
    // RVH itself keeps this to only the RVH side of every resolved position.
    ownTokens: sumTokensExport({
      owners: [VAULT, DAO_WALLET],
      tokens: [RVH_TOKEN],
      resolveUniV3: true,
      uniV3ExtraConfig: { nftAddress: UNISWAP_V3_NFT_MANAGER },
      uniV3WhitelistedTokens: [RVH_TOKEN],
    }),
  },
}
