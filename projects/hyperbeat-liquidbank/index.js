// beatUSD (Hyperbeat USD) - treasury-backed, $1-pegged stablecoin on HyperEVM,
// minted 1:1 when users deposit into their Hyperbeat account. Not in DefiLlama's
// price feed, so valued directly at $1 (6 decimals).
const beatUSD = '0x669abe85F96a9e3B34723F7Be9bC6F250aBC0Cc1'

// Part of the beatUSD supply is borrowed against collateral in the Hyperbeat
// credit markets (tracked by hyperbeat-liquidbank-credit). That borrowed beatUSD
// is included in totalSupply but is already represented by its collateral in the
// credit listing, so we subtract it here to avoid double-counting.
const MORPHO = '0x68e37dE8d93d3496ae143F2E900490f6280C57cD'
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
  const supply = await api.call({ target: beatUSD, abi: 'erc20:totalSupply' })
  const markets = await api.multiCall({ target: MORPHO, abi: marketAbi, calls: creditMarketIds })
  const borrowed = markets.reduce((acc, m) => acc + Number(m.totalBorrowAssets), 0)
  // Deposit-backed beatUSD = total supply minus beatUSD borrowed in the credit markets.
  api.addUSDValue((Number(supply) - borrowed) / 1e6)
}

module.exports = {
  methodology: 'TVL is the deposit-backed beatUSD (Hyperbeat USD): total supply of the treasury-backed $1 stablecoin minus the beatUSD borrowed in the Hyperbeat credit markets (already represented by its collateral in hyperbeat-liquidbank-credit), to avoid double-counting.',
  start: '2025-11-11',
  hyperliquid: { tvl },
}
