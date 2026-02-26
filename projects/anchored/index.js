const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

const deployments = {
  monad: {
    token: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603', // USDC on Monad
    owners: [
      '0x8c1b182bb0fe4e8407404ffe37c974d6dacef3a9', // AncCashier
    ],
  },
}

const STOCK_DECIMALS = 18
const PRICE_DECIMALS = 8
const API_BASE_URL = 'https://rwa-api.anchored.finance/rwa/api/v1'
const STOCK_LIST_ENDPOINT = '/market/stocks'
const STOCK_MARKET_ENDPOINT = '/market/stock/info'

const addressRegex = /^0x[a-fA-F0-9]{40}$/
const digitRegex = /^\d+$/

function parsePriceToScaledInt(price) {
  const raw = String(price || '').trim()
  if (!raw || raw.startsWith('-')) return null
  const [wholePart, decimalPart = ''] = raw.split('.')
  if (!digitRegex.test(wholePart || '0')) return null
  if (decimalPart && !digitRegex.test(decimalPart)) return null

  const normalizedWhole = wholePart || '0'
  const normalizedDecimal = (decimalPart + '0'.repeat(PRICE_DECIMALS)).slice(0, PRICE_DECIMALS)
  return BigInt(normalizedWhole + normalizedDecimal)
}

async function fetchApiData(path) {
  const url = `${API_BASE_URL}${path}`
  const response = await get(url)
  if (response?.code === 0 && response?.data) return response.data
  throw new Error(`Invalid response payload from ${url}`)
}

function buildStockConfigs(stockList, marketInfo) {
  const priceMap = new Map()

  for (const stock of marketInfo) {
    const symbol = stock?.symbol
    if (!symbol) continue
    const scaledPrice = parsePriceToScaledInt(stock?.price)
    if (!scaledPrice || scaledPrice <= 0n) continue
    priceMap.set(symbol, scaledPrice)
  }

  const tokenMap = new Map()
  for (const stock of stockList) {
    const contract = (stock?.contract || '').toLowerCase()
    const symbol = stock?.symbol
    if (!addressRegex.test(contract) || !symbol) continue
    const scaledPrice = priceMap.get(symbol)
    if (!scaledPrice) continue
    tokenMap.set(contract, { contract, scaledPrice })
  }

  return [...tokenMap.values()]
}

async function addStocksTvl(api) {
  const [stockListData, marketInfoData] = await Promise.all([
    fetchApiData(STOCK_LIST_ENDPOINT),
    fetchApiData(STOCK_MARKET_ENDPOINT),
  ])

  const stockList = stockListData?.list || []
  const marketInfo = marketInfoData?.stocks || []
  if (!stockList.length || !marketInfo.length) return

  const stockConfigs = buildStockConfigs(stockList, marketInfo)
  if (!stockConfigs.length) return

  const supplies = await Promise.all(
    stockConfigs.map(stock => api.call({
      abi: 'erc20:totalSupply',
      target: stock.contract,
      permitFailure: true,
    }))
  )

  stockConfigs.forEach((stock, i) => {
    const supply = supplies[i]
    if (!supply) return

    let rawSupply
    try {
      rawSupply = BigInt(supply.toString())
    } catch (e) {
      return
    }
    if (rawSupply <= 0n) return

    const usdScaled = (rawSupply * stock.scaledPrice) / (10n ** BigInt(STOCK_DECIMALS))
    if (usdScaled <= 0n) return
    api.addUSDValue(Number(usdScaled) / 10 ** PRICE_DECIMALS)
  })
}

async function tvl(api) {
  const chainConfig = deployments[api.chain]
  if (!chainConfig) throw new Error(`unsupported chain: ${api.chain}`)

  await sumTokens2({ api, token: chainConfig.token, owners: chainConfig.owners })
  await addStocksTvl(api)
  return api.getBalances()
}

module.exports = {
  methodology:
    'Counts USDC held in Anchored AncCashier on Monad, then adds stock TVL by summing on-chain stock token totalSupply multiplied by live stock prices from Anchored backend API. Excludes Monday and broker-side transient balances such as gateway and broker wallet.',
  start: 1770704924,
  monad: { tvl },
}

