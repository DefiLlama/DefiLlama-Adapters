const ADDRESSES = require('../helper/coreAssets.json')
const V1_POOLS = [
  { pool: '0x8124cD94629Bd7e902D9B7dabDcef71F9847b232', tokenA: ADDRESSES.ethereum.DAI, tokenB: ADDRESSES.ethereum.WETH },
  { pool: '0x9a2789dd698D010f3d6Bb5Bf865369A734D43f83', tokenA: ADDRESSES.ethereum.WBTC, tokenB: ADDRESSES.ethereum.DAI },
  { pool: '0xa649C9306896f90d6f8a3366f29be10557461144', tokenA: ADDRESSES.ethereum.YFI, tokenB: ADDRESSES.ethereum.WETH },
  { pool: '0xC62D0265ADCe0719373661FFF26d93980f5e6Fc0', tokenA: ADDRESSES.ethereum.USDC, tokenB: ADDRESSES.ethereum.WETH },
  { pool: '0xAc324adB90eDA530884eB0f5BE58614c6249484a', tokenA: ADDRESSES.ethereum.WETH, tokenB: '0xD291E7a03283640FDc51b121aC401383A46cC623' },
  { pool: '0x82Eb5b1F3A2286903F5918f8a42Cc84A2ea500fb', tokenA: ADDRESSES.ethereum.WETH, tokenB: ADDRESSES.ethereum.USDT },
  { pool: '0x59aCef0FC104EDe425DF5CD3a1677A09e7e025cD', tokenA: '0x2602278EE1882889B946eb11DC0E810075650983', tokenB: ADDRESSES.ethereum.WETH },
]

const TOKENS_IN_LEGACY_VERSIONS = {
  optimism: [
    '0x00f932f0fe257456b32deda4758922e56a4f4b42', // PAPER
    '0x1da650c3b2daa8aa9ff6f661d4156ce24d08a062', // DCN
    '0x296f55f8fb28e498b858d0bcda06d955b2cb3f97', // STG
    '0x298b9b95708152ff6968aafd889c6586e9169f1d', // sBTC
    '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6', // LINK
    ADDRESSES.tombchain.FTM, // WETH
    ADDRESSES.optimism.OP, // OP
    ADDRESSES.optimism.BitANT, // BitANT
    ADDRESSES.base.DAI, // LYRA
    '0x65559aa14915a70190438ef90104769e5e890a00', // ENS
    ADDRESSES.optimism.WBTC, // WBTC
    '0x6fd9d7ad17242c41f7131d257212c54a0e816691', // UNI
    ADDRESSES.optimism.USDC, // USDC
    '0x7fb688ccf682d58f86d7e38e03f9d22e7705448b', // RAI
    '0x8700daec35af8ff88c16bdf0418774cb3d7599b4', // SNX
    ADDRESSES.optimism.sUSD, // sUSD
    ADDRESSES.optimism.USDT, // USDT
    '0x9bcef72be871e61ed4fbbc7630889bee758eb81d', // rETH
    '0x9e1028f5f1d5ede59748ffcee5532509976840e0', // PERP
    ADDRESSES.optimism.DAI, // DAI
    '0xe0bb0d3de8c10976511e5030ca403dbf4c25165b', // 0xBTC
    ADDRESSES.optimism.sETH, // sETH
    '0xf98dcd95217e15e05d8638da4c91125e59590b07', // KROM
  ],
  polygon: [
    '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a', // SUSHI
    ADDRESSES.polygon.WMATIC_2, // WMATIC
    '0x172370d5cd63279efa6d502dab29171933a610af', // CRV
    ADDRESSES.polygon.WBTC, // WBTC
    ADDRESSES.polygon.USDC, // USDC
    '0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b', // AVAX
    '0x3066818837c5e6ed6601bd5a91b0762877a6b731', // UMA
    '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4', // stMATIC
    ADDRESSES.polygon.FRAX, // FRAX
    '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c', // jEUR
    '0x50b728d8d964fd00c2d0aad81718b71311fef68a', // SNX
    '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', // LINK
    '0x5fe2b58c013d7601147dcdd68c143a77499f5531', // GRT
    '0x6f7c932e7684666c9fd1d44527765433e01ff61d', // MKR
    ADDRESSES.polygon.WETH_1, // WETH
    '0x831753dd7087cac61ab5644b308642cc1c33dc13', // QUICK
    '0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c', // COMP
    ADDRESSES.polygon.DAI, // DAI
    '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3', // BAL
    '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4', // MANA
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1', // miMATIC
    '0xb33eaad8d922b1083446dc23f610c2567fb5180f', // UNI
    '0xbbba073c31bf03b8acf7c28ef0738decf3695683', // SAND
    ADDRESSES.polygon.USDT, // USDT
    '0xd6df932a45c0f255f85145f286ea0b292b21c90b', // AAVE
    '0xda537104d6a5edd53c6fbba9a898708e465260b6', // YFI
  ]
}
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const YIELD_VERSION = (chain) => {
  if (chain == 'rsk') return '0x8CC0Df843610cefF7f4AFa01100B6abf6756Bdf2';
  else return '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345';
}
const YIELDLESS_VERSION = '0x059d306A25c4cE8D7437D25743a8B94520536BD5'
const VULN_VERSION = '0x230C63702D1B5034461ab2ca889a30E343D81349'
const BETA_VERSION = '0x24F85583FAa9F8BD0B8Aa7B1D1f4f53F0F450038'

const LEGACY_VERSIONS = {
  optimism: [BETA_VERSION, VULN_VERSION, YIELDLESS_VERSION],
  polygon: [VULN_VERSION, YIELDLESS_VERSION]
}

async function getTokensInChain(chain) {
  const data = await getConfig('mean-finance/'+chain, `https://api.balmy.xyz/v1/dca/networks/${chain}/tokens?includeNotAllowed`)
  return data.map(({ address }) => address)
}

function getV2TvlObject(chain) {
  return {
    tvl: (_, __, chainBlocks) => getV2TVL(chain, chainBlocks[chain])
  }
}

async function getV2TVL(chain, block) {
  const legacyVersions = LEGACY_VERSIONS[chain] ?? []
  const legacyTokens = TOKENS_IN_LEGACY_VERSIONS[chain] ?? []
  const tokens = await getTokensInChain(chain)
  const versions = [
    ...legacyVersions.map(contract => ({ contract, tokens: legacyTokens })),
    { contract: YIELD_VERSION(chain), tokens }
  ]

  const toa = versions.map(({ contract, tokens }) => tokens.map(t => ([t, contract]))).flat()
  return sumTokens2({ chain, block, tokensAndOwners: toa})
}

async function ethTvl(timestamp, block) {
  const balances = await getV2TVL('ethereum', block)
  return ethV1Tvl(block, balances)
}

async function ethV1Tvl(block, balances = {}) {
  const toa = []
  // Calls for tokens in pair and balances of them then adds to balance
  for (let i = 0; i < V1_POOLS.length; i++) {
    const { pool, tokenA, tokenB } = V1_POOLS[i]
    toa.push([tokenA, pool], [tokenB, pool])
  }

  return sumTokens2({ balances, tokensAndOwners: toa, block, });
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  },
  optimism: getV2TvlObject('optimism'),
  polygon: getV2TvlObject('polygon'),
  arbitrum: getV2TvlObject('arbitrum'),
  bsc: getV2TvlObject('bsc'),
  xdai: getV2TvlObject('xdai'),
  moonbeam: getV2TvlObject('moonbeam'),
  avax: getV2TvlObject('avax'),
  rsk: getV2TvlObject('rsk'),
  base: getV2TvlObject('base'),
   hallmarks: [
    ['2022-04-16', "Protocol is paused due to non-critical vulnerability"],
    ['2022-06-01', "Deployment on Optimism"],
    ['2022-11-09', "Deployment on Arbitrum"],
    ['2022-12-27', "Deployment on Ethereum"],
    ['2023-06-01', "Deployment on BNB"],
  ]
};
