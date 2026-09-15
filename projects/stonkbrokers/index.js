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

// Smart LP (Volatility Farming) — immutable concentrated-liquidity vaults on
// canonical Uniswap V3 pools. The on-chain registry is the single discovery
// surface; each listed vault owns exactly one NFPM position plus small idle
// token balances between compounds.
const SMART_LP_REGISTRY = '0xE8749183Fbf6A657EB58B3a4D3E4B9Cc09560146'

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
  // Smart LP vaults: registry-enumerated, each vault owns one Uniswap V3
  // position on the canonical NFPM. Both position legs are counted (quote
  // legs are WETH/USDG; base legs are tokenized stocks / ecosystem tokens),
  // plus the idle token0/token1 balances each vault holds between compounds.
  const smartLpVaults = await api.call({ abi: 'address[]:all', target: SMART_LP_REGISTRY })
  if (smartLpVaults.length) {
    await sumTokens2({
      api,
      owners: smartLpVaults,
      resolveUniV3: true,
      uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM },
    })
    const [token0s, token1s] = await Promise.all([
      api.multiCall({ abi: 'address:token0', calls: smartLpVaults }),
      api.multiCall({ abi: 'address:token1', calls: smartLpVaults }),
    ])
    const ownerTokens = smartLpVaults.map((vault, i) => [[token0s[i], token1s[i]], vault])
    await sumTokens2({ api, ownerTokens })
  }
  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is the liquidity permanently locked in the Safety Deposit Box lockers: Uniswap V3 position NFTs escrowed in the V3 box, plus up. DEX (Slipstream) positions escrowed in the up. box — including every Stonklauncher / Safe Launch graduation pool across the V1 ETH pad, V1 quoted lanes, V2 lanes, and r2 pads (raise + LP tax reserve locked forever at bond; V2 Uniswap-v3 venue bonds land in the V3 box). Only the WETH side of each locker position is counted (meme-token legs stay unpriced). Plus the Smart LP (Volatility Farming) vaults: registry-listed immutable concentrated-liquidity vaults on canonical Uniswap V3 pools — each vault owns one position NFT (both legs counted: WETH/USDG quote side and the tokenized-stock / ecosystem-token base side) plus idle balances held between compounds. Staking tracks STONKBROKER tokens in the escrow contract.',
  doublecounted: true,
  robinhood: {
    tvl,
    staking: sumTokensExport({ owner: STONK_ESCROW, tokens: [STONKBROKER] }),
  },
}
