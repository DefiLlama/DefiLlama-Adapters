const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const primeUSD = '0x7ea76108975ec0998b9bc2db04b4eca986400dd7'
const priceOracle = '0x8cda03e2004c35e07963fb792c6b7511dabee369'

// oracle price is scaled to 8 decimals (primeUSD/USDC)
const PRICE_DECIMALS = 8n
const USDC_DECIMALS = 6n

async function tvl(api) {
  const [supply, primeDecimals, price] = await Promise.all([
    api.call({ target: primeUSD, abi: 'erc20:totalSupply' }),
    api.call({ target: primeUSD, abi: 'erc20:decimals' }),
    api.call({ target: priceOracle, abi: 'function lastPrice() view returns (uint256 value, uint256 timestamp)' }),
  ])

  // value primeUSD in USDC terms, then express the balance in USDC's own decimals
  const scale = 10n ** (BigInt(primeDecimals) + PRICE_DECIMALS - USDC_DECIMALS)
  const usdcBalance = (BigInt(supply) * BigInt(price.value)) / scale

  api.add(USDC, usdcBalance)
}

module.exports = {
  methodology: 'TVL is the total supply of primeUSD valued in USDC using the on-chain lastPrice oracle.',
  ethereum: { tvl },
}
