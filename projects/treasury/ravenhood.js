const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

// RavenhoodVault — permanently locked, protocol-owned RVH/WETH Uniswap V3 position
const VAULT = '0x5e1485137E025bf7774F52DE4E33fa6E498f6ede'
// DAO treasury wallet — interim EOA (moving to a multisig). Holds plain
// USDG/ETH plus DAO-owned LP positions pairing RVH against tokenized
// stocks/blue chips (the "expansion liquidity" the burn engine funds).
const DAO_WALLET = '0x097ba31b7ACfFd75B909fc7BEf2e55424d2dAcdc'
const RVH_TOKEN = '0x96765066f6a040a21EB027167D2315B707c82633'

// Standard Uniswap-V3-shaped position managers (positions() has a bps `fee`
// field, factory.getPool(address,address,uint24 fee)) -- resolveUniV3
// auto-discovers every position either owner holds on each, not just one pair.
const UNIV3_NFT_MANAGERS = [
  '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3', // Uniswap V3
  '0xA79F5775b0B49E51202c48DDF03F380FaA96f641', // Giga (same Uniswap V3 ABI shape)
]

// UPDex is a Slipstream/Aerodrome-style CL fork: positions() has a pool
// `tickSpacing` where standard Uniswap V3 has `fee`, and its factory's
// getPool(address,address,int24 tickSpacing) has a DIFFERENT selector than
// the uint24-fee version the plain resolveUniV3 path calls -- mixing it into
// UNIV3_NFT_MANAGERS above makes every position on it revert ("could not
// decode result data"), confirmed via this PR's own CI run. Needs the
// dedicated Slipstream resolver (unwrapSlipstreamNFT) instead.
const UPDEX_NFT_MANAGER = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'

const univ3Tvl = sumTokensExport({
  owners: [VAULT, DAO_WALLET],
  tokens: [ADDRESSES.robinhood.USDG, ADDRESSES.null],
  resolveUniV3: true,
  uniV3ExtraConfig: { nftAddress: UNIV3_NFT_MANAGERS },
  blacklistedTokens: [RVH_TOKEN],
})

async function updexTvl(api) {
  const balances = {}
  await Promise.all([VAULT, DAO_WALLET].map((owner) =>
    unwrapSlipstreamNFT({ api, balances, owner, nftAddress: UPDEX_NFT_MANAGER, blacklistedTokens: [RVH_TOKEN] })
  ))
  return balances
}

// uniV3WhitelistedTokens (not blacklistedTokens) is required here: the DAO
// wallet's LP positions pair RVH against many different tokens (WETH,
// VIRTUAL, MSFT, TSLA, AAPL, NVDA, SPY, PLTR, GOOGL, ...), so blacklisting
// just one quote token leaks all the others into "ownTokens". Whitelisting
// RVH itself keeps this to only the RVH side of every resolved position.
const univ3OwnTokens = sumTokensExport({
  owners: [VAULT, DAO_WALLET],
  tokens: [RVH_TOKEN],
  resolveUniV3: true,
  uniV3ExtraConfig: { nftAddress: UNIV3_NFT_MANAGERS },
  uniV3WhitelistedTokens: [RVH_TOKEN],
})

async function updexOwnTokens(api) {
  const balances = {}
  await Promise.all([VAULT, DAO_WALLET].map((owner) =>
    unwrapSlipstreamNFT({ api, balances, owner, nftAddress: UPDEX_NFT_MANAGER, whitelistedTokens: [RVH_TOKEN] })
  ))
  return balances
}

module.exports = {
  robinhood: {
    tvl: sdk.util.sumChainTvls([univ3Tvl, updexTvl]),
    ownTokens: sdk.util.sumChainTvls([univ3OwnTokens, updexOwnTokens]),
  },
}
