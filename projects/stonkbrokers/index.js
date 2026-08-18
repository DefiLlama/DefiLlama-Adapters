const { sumTokens2, unwrapSlipstreamNFT, sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Safety Deposit Box — Uniswap V3 box locker (position NFTs escrowed
// permanently or on long vests) + the up. DEX (Slipstream) box locker, which
// also holds every Safe Launch pad graduation pool (100% of each launch's
// raise + LP tax reserve is locked there forever at bond).
const V3_BOX_LOCKER = '0xFc96CF67eCC55bE4AdABc3AecBe6Ad6349f11223'
const UNI_V3_NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const UP_CL_BOX_LOCKER = '0xc1AfA59e2aBC1C868C51a1F799a7578EaCfEa076'
const UP_SLIPSTREAM_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'

const STONK_ESCROW = '0x799AE26fA515ceF145e8bC8636F7fFF87B05Cf62'
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'

async function tvl(api) {
  // Uniswap V3 box positions (WETH side only — meme pair legs stay unpriced).
  await sumTokens2({
    api,
    owner: V3_BOX_LOCKER,
    resolveUniV3: true,
    uniV3WhitelistedTokens: [ADDRESSES.robinhood.WETH],
    uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM },
  })
  // up. DEX (Slipstream) box positions, incl. all Safe Launch locked pools.
  // Called directly because the slipstream resolver has no Robinhood default
  // NFPM and the shared sumTokens2 config cannot carry a second one.
  await unwrapSlipstreamNFT({
    api,
    owner: UP_CL_BOX_LOCKER,
    nftAddress: UP_SLIPSTREAM_NFPM,
    whitelistedTokens: [ADDRESSES.robinhood.WETH],
  })
  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is the liquidity permanently locked in the Safety Deposit Box lockers: Uniswap V3 position NFTs escrowed in the V3 box, plus up. DEX (Slipstream) positions escrowed in the up. box — including every Safe Launch pad graduation pool, whose full raise + LP tax reserve is locked forever at bond. Only the WETH side of each position is counted (meme-token legs stay unpriced). Staking tracks STONKBROKER tokens in the escrow contract.',
  robinhood: {
    tvl,
    staking: sumTokensExport({ owner: STONK_ESCROW, tokens: [STONKBROKER] }),
  },
}
