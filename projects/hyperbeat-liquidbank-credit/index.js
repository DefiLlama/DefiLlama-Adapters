// Hyperbeat credit market. Collateral is held in Hyperbeat's own wrapper
// contracts, which are then used in dedicated Morpho Blue markets to borrow
// beatUSD. To avoid double-counting the Morpho markets (tracked under Morpho
// Blue), we count the underlying assets locked in each Hyperbeat wrapper
// contract and let DefiLlama price them. Loan token is beatUSD ($1, 6 decimals).
const MORPHO = '0x68e37dE8d93d3496ae143F2E900490f6280C57cD'
const BEAT_USD_DECIMALS = 1e6

// wrapper collateral token -> its underlying asset (priced by DefiLlama)
const wrappers = [
  { wrapper: '0x1B01F8CEF529f8799532E5a015dD7Ec8Bf2a7513', underlying: '0x5555555555555555555555555555555555555555' }, // wWHYPE -> WHYPE
  { wrapper: '0x516fd25c9bb62C48395FE1963978d129Dc29fbd1', underlying: '0xd8FC8F0b03eBA61F64D08B0bef69d80916E5DdA9' }, // wbeHYPE -> beHYPE
  { wrapper: '0x0e2be97f03Ee98b466bEf1cc15CFd0Ca020abc85', underlying: '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463' }, // wUBTC -> UBTC
  { wrapper: '0x037a67590ac5AE9CA9ae3079Fab6562B2782acF2', underlying: '0xBe6727B535545C67d5cAa73dEa54865B92CF7907' }, // wUETH -> UETH
  { wrapper: '0x5c3aBD61DBc9192535011aCd211C388060862589', underlying: '0x068f321Fa8Fb9f0D135f290Ef6a3e2813e1c8A29' }, // wUSOL -> USOL
  { wrapper: '0xC315A169F49B167870E7eecb8e7ee5d6275b47d8', underlying: '0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949' }, // wXAUt0 -> XAUt0
]

// masterUSD wrapper: its underlying (the masterUSD vault) isn't in DefiLlama's
// price feed, so value it via the vault's getRate() (denominated in USDC, ~$1).
const wmasterUSD = '0xc9d9cB68A87CfD9079f0bA28f98f50b316dF0efB'
const masterUSDVault = '0x9065E3153B1393Bb5f76520cdc1e08E49eb04B03'
const masterUSDPricer = '0x5362454e5648C6Ac7F03969E8a62CFc61F99b9D6'

const creditMarketIds = [
  '0x063ad132f8637cfad29660f8c28a522d63af268bb7bcbbab92c28a28d6b6090e', // wHYPE
  '0xda35ec213f5d27609210fd14f148dee5e84bbec87dd79e893df4dca18bf07cac', // wbeHYPE
  '0x3614200586f926ce2f712f60ff01270d19cb930369c1f81f3160adf1bdcbcf0d', // wUBTC
  '0x41fc21455f4890fa3d680a5433ab780360f31e6d4a53cdca282a53a3b8cb45d6', // wUETH
  '0x520dc6596ad9dc2a5c21bde2f35e38ed48179ee38916e418cc505101a2ceeca5', // wUSOL
  '0x63c34750ab0b0b204d236f3e103d8477c9737710a065b1a40c8e126ddcd2cbd7', // wXAUt0
  '0xff1cfb42c8731ca052c585fca4d8c8d24ca47f43bd918bcec1282370e4db4d4f', // wmasterUSD
]
const marketAbi = 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)'

const tvl = async (api) => {
  // Underlying assets locked in each Hyperbeat wrapper contract, priced by DefiLlama.
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: wrappers.map((w) => ({ target: w.underlying, params: [w.wrapper] })) })
  wrappers.forEach((w, i) => api.add(w.underlying, balances[i]))

  // masterUSD wrapper -> masterUSD vault, valued via getRate() (USDC ~ $1).
  const [masterBal, rate] = await Promise.all([
    api.call({ target: masterUSDVault, abi: 'erc20:balanceOf', params: [wmasterUSD] }),
    api.call({ target: masterUSDPricer, abi: 'uint256:getRate' }),
  ])
  api.addUSDValue((Number(masterBal) / BEAT_USD_DECIMALS) * (Number(rate) / 1e8))
}

const borrowed = async (api) => {
  const markets = await api.multiCall({ target: MORPHO, abi: marketAbi, calls: creditMarketIds })
  for (const market of markets) {
    api.addUSDValue(Number(market.totalBorrowAssets) / BEAT_USD_DECIMALS)
  }
}

module.exports = {
  methodology: "TVL is the collateral backing Hyperbeat's credit market, counted as the underlying assets locked in Hyperbeat's wrapper contracts (priced by DefiLlama; masterUSD valued via its getRate). Borrowed is the outstanding beatUSD debt across the markets.",
  start: '2025-11-11',
  hyperliquid: { tvl, borrowed },
}
