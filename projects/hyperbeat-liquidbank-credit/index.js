const ADDRESSES = require('../helper/coreAssets.json')

// Hyperbeat credit market: users post collateral (HYPE, beHYPE, BTC, ETH, SOL,
// XAUt0, masterUSD as 1:1 HyperEVM wrappers) into dedicated Morpho Blue markets
// and the Operator borrows beatUSD against it. All collateral/debt in these
// markets belongs to Hyperbeat. Loan token is beatUSD ($1, 6 decimals).
const MORPHO = '0x68e37dE8d93d3496ae143F2E900490f6280C57cD'

const marketIds = [
  '0x063ad132f8637cfad29660f8c28a522d63af268bb7bcbbab92c28a28d6b6090e', // wHYPE
  '0xda35ec213f5d27609210fd14f148dee5e84bbec87dd79e893df4dca18bf07cac', // wbeHYPE
  '0x3614200586f926ce2f712f60ff01270d19cb930369c1f81f3160adf1bdcbcf0d', // wUBTC
  '0x41fc21455f4890fa3d680a5433ab780360f31e6d4a53cdca282a53a3b8cb45d6', // wUETH
  '0x520dc6596ad9dc2a5c21bde2f35e38ed48179ee38916e418cc505101a2ceeca5', // wUSOL
  '0x63c34750ab0b0b204d236f3e103d8477c9737710a065b1a40c8e126ddcd2cbd7', // wXAUt0
  '0xff1cfb42c8731ca052c585fca4d8c8d24ca47f43bd918bcec1282370e4db4d4f', // wmasterUSD
]

const paramsAbi = 'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)'
const marketAbi = 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)'
const priceAbi = 'function price() view returns (uint256)'

const ORACLE_SCALE = 10n ** 36n
const BEAT_USD_DECIMALS = 1e6

// Collateral tokens are bespoke wrappers not in DefiLlama's price feed, so we
// value collateral via each market's Morpho oracle, which prices it in the loan
// token (beatUSD ~ $1). collateralUSD = balance * price / 1e36 / 1e6.
const tvl = async (api) => {
  const params = await api.multiCall({ target: MORPHO, abi: paramsAbi, calls: marketIds })

  const valid = params
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.collateralToken !== ADDRESSES.null && p.oracle !== ADDRESSES.null)

  const [balances, prices] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: valid.map(({ p }) => ({ target: p.collateralToken, params: [MORPHO] })), permitFailure: true }),
    api.multiCall({ abi: priceAbi, calls: valid.map(({ p }) => p.oracle), permitFailure: true }),
  ])

  valid.forEach((_, j) => {
    if (!balances[j] || !prices[j]) return
    const collateralInLoan = (BigInt(balances[j]) * BigInt(prices[j])) / ORACLE_SCALE // beatUSD raw (6 decimals)
    api.addUSDValue(Number(collateralInLoan) / BEAT_USD_DECIMALS)
  })
}

const borrowed = async (api) => {
  const markets = await api.multiCall({ target: MORPHO, abi: marketAbi, calls: marketIds })
  for (const market of markets) {
    api.addUSDValue(Number(market.totalBorrowAssets) / BEAT_USD_DECIMALS)
  }
}

module.exports = {
  methodology: 'TVL is the collateral posted across Hyperbeat\'s dedicated Morpho Blue markets (valued in beatUSD via each market\'s oracle); borrowed is the outstanding beatUSD debt in those markets.',
  start: '2025-11-11',
  hyperliquid: { tvl, borrowed },
}
