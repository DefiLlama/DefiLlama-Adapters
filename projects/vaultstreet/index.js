const ADDRESSES = require('../helper/coreAssets.json')
const USDC = ADDRESSES.ethereum.USDC

// oracle prices are scaled to 8 decimals (token/USDC)
const PRICE_DECIMALS = 8n
const USDC_DECIMALS = 6n

const ONE_DAY = 24 * 3600;
const ONE_HOUR = 3600;

const tokens = [
  {
    name: 'primeUSD',
    token: '0x7ea76108975ec0998b9bc2db04b4eca986400dd7',
    priceOracle: '0x8cda03e2004c35e07963fb792c6b7511dabee369',
    stalenessPeriod: ONE_DAY,
  },
  {
    name: 'CARRY',
    token: '0xF05F7Ab9B05D9Dcf99B8E9bBAE8E5e4A3201D004',
    priceOracle: '0xd610FAbAB31C6D76B50A49C337fc39D6559E0E87',
    stalenessPeriod: 7 * ONE_DAY + ONE_HOUR, // 169h
  },
]

async function tvl(api) {
  for (const { name, token, priceOracle, stalenessPeriod } of tokens) {
    const [supply, decimals, price] = await Promise.all([
      api.call({ target: token, abi: 'erc20:totalSupply' }),
      api.call({ target: token, abi: 'erc20:decimals' }),
      api.call({ target: priceOracle, abi: 'function lastPrice() view returns (uint256 value, uint256 timestamp)' }),
    ])
    if (api.timestamp - price.timestamp > stalenessPeriod) throw new Error(`Stale price data from ${name} oracle`);

    // value the token in USDC terms, then express the balance in USDC's own decimals
    const scale = 10n ** (BigInt(decimals) + PRICE_DECIMALS - USDC_DECIMALS)
    const usdcBalance = (BigInt(supply) * BigInt(price.value)) / scale

    api.add(USDC, usdcBalance)
  }
}

module.exports = {
  methodology: 'TVL is the total supply of primeUSD and CARRY valued in USDC using their on-chain lastPrice oracles.',
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: { tvl },
}
