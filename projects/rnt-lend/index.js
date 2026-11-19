const ADDRESSES = require('../helper/coreAssets.json')

// RNT Lend — Reental's Aave V3 fork on Polygon (RWA real-estate tokens as collateral, USDT0/USDC as borrowable assets)
// Pool:                 0x67dC8037Db6309Dd5571D82c65F5f593F7da1505
// PoolAddressesProvider: 0x717c2a6fa0820b04b9d4793daca33a229aec85ca
const POOL_DATA_PROVIDER = '0x5542ac41138f6a52a13c644f1db56bada71a4021'
const AAVE_ORACLE = '0x9e313d8cda997dceea20bea444720702958cd0f3'

const abi = {
  getAllReservesTokens: 'function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])',
  getReserveTokensAddresses: 'function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)',
  getReserveData: 'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
  getAssetsPrices: 'function getAssetsPrices(address[] assets) view returns (uint256[])',
  BASE_CURRENCY_UNIT: 'uint256:BASE_CURRENCY_UNIT',
}

// Assets DefiLlama already prices; everything else is a Reental property token (1 token = 100 EUR or 100 USD)
// that has no market price, so it is valued with the protocol's own AaveOracle (USD, 8 decimals).
const PRICED = new Set([ADDRESSES.polygon.USDT, ADDRESSES.polygon.USDC_CIRCLE].map(a => a.toLowerCase()))

async function getReserves(api) {
  const reserves = (await api.call({ target: POOL_DATA_PROVIDER, abi: abi.getAllReservesTokens })).map(r => r.tokenAddress)
  const [decimals, prices, baseUnit] = await Promise.all([
    api.multiCall({ abi: 'erc20:decimals', calls: reserves }),
    api.call({ target: AAVE_ORACLE, abi: abi.getAssetsPrices, params: [reserves] }),
    api.call({ target: AAVE_ORACLE, abi: abi.BASE_CURRENCY_UNIT }),
  ])
  return { reserves, decimals, prices, baseUnit }
}

function addAmount(api, token, amount, decimals, price, baseUnit) {
  if (!+amount) return
  if (PRICED.has(token.toLowerCase())) return api.add(token, amount)
  api.addUSDValue((Number(amount) / 10 ** Number(decimals)) * (Number(price) / Number(baseUnit)))
}

async function tvl(api) {
  const { reserves, decimals, prices, baseUnit } = await getReserves(api)
  const tokenAddresses = await api.multiCall({ target: POOL_DATA_PROVIDER, abi: abi.getReserveTokensAddresses, calls: reserves })
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: reserves.map((token, i) => ({ target: token, params: tokenAddresses[i].aTokenAddress })) })
  reserves.forEach((token, i) => addAmount(api, token, balances[i], decimals[i], prices[i], baseUnit))
}

async function borrowed(api) {
  const { reserves, decimals, prices, baseUnit } = await getReserves(api)
  const data = await api.multiCall({ target: POOL_DATA_PROVIDER, abi: abi.getReserveData, calls: reserves })
  reserves.forEach((token, i) => {
    const debt = BigInt(data[i].totalVariableDebt) + BigInt(data[i].totalStableDebt)
    addAmount(api, token, debt.toString(), decimals[i], prices[i], baseUnit)
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is the balance of every reserve asset held by its aToken in the RNT Lend pool (Aave V3 fork). Borrowed is the total variable + stable debt of each reserve. USDT0 and USDC are priced by DefiLlama; Reental real-estate tokens (1 token = 100 EUR/USD of property) have no market price and are valued with the pool\'s own AaveOracle.',
  polygon: { tvl, borrowed },
}
