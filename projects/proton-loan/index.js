const { getCurrencyBalance, } = require("../helper/chain/proton");

const LOAN_TOKEN_CONTRACT = 'loan.token';
const STAKING_CONTRACT = 'lock.token';

const { post } = require('../helper/http')
const sdk = require('@defillama/sdk')

const tokenMapping = {
  'xtokens:XBTC': 'bitcoin',
  'xtokens:XLTC': 'litecoin',
  'xtokens:XETH': 'ethereum',
  'xtokens:XXRP': 'ripple',
  'eosio.token:XPR': 'proton',
  'xtokens:XMT': 'metal',
  'xtokens:XUSDC': 'usd-coin',
  'xtokens:XDOGE': 'dogecoin',
  'xtokens:XUSDT': 'tether',
  'xtokens:XUST': 'terrausd-wormhole',
  'xtokens:XLUNA': 'terra-luna-2',
  'xtokens:XADA': 'cardano',
  'xtokens:XXLM': 'stellar',
  'xtokens:XHBAR': 'hedera-hashgraph',
  'xtokens:XSOL': 'solana',
}

const API_ENDPOINT = 'https://proton.eosusa.io'
const LENDING_CONTRACT = 'lending.loan'

function parseAsset(assetString) {
  if (!assetString) return { amount: 0, symbol: '' }
  const [amount, symbol] = assetString.split(' ')
  return { amount: parseFloat(amount), symbol }
}

async function fetchMarkets() {
  const res = await post(`${API_ENDPOINT}/v1/chain/get_table_rows`, {
    code: LENDING_CONTRACT,
    scope: LENDING_CONTRACT,
    table: 'markets',
    limit: 100,
    json: true,
  })
  return res.rows || []
}

async function fetchLiquidity(tokenContract, symbol) {
  // available liquidity (cash) held by lending.loan for a given token
  const res = await post(`${API_ENDPOINT}/v1/chain/get_table_rows`, {
    code: tokenContract,
    scope: LENDING_CONTRACT,
    table: 'accounts',
    limit: 100,
    json: true,
  })
  const rows = res.rows || []
  const tokenBalance = rows.find(b => parseAsset(b.balance).symbol === symbol)
  return tokenBalance ? parseAsset(tokenBalance.balance).amount : 0
}

// ----------------------------
// TVL = only available liquidity (cash)
// ----------------------------
async function tvl() {
  const balances = {}
  const markets = await fetchMarkets()

  const promises = markets.map(async (market) => {
    const [ , symbol ] = market.underlying_symbol.sym.split(',')
    const tokenContract = market.underlying_symbol.contract
    const internalId = `${tokenContract}:${symbol}`
    const cgkId = tokenMapping[internalId]
    if (!cgkId) return

    const cashAvailable = await fetchLiquidity(tokenContract, symbol)
    sdk.util.sumSingleBalance(balances, `coingecko:${cgkId}`, cashAvailable)
  })

  await Promise.all(promises)
  return balances
}

// ----------------------------
// Borrowed = total variable + stable borrows
// ----------------------------
async function borrowed() {
  const balances = {}
  const markets = await fetchMarkets()

  markets.forEach(market => {
    const totalVar = parseAsset(market.total_variable_borrows.quantity).amount
    const totalStable = parseAsset(market.total_stable_borrows.quantity).amount
    const totalBorrows = totalVar + totalStable

    const [ , symbol ] = market.underlying_symbol.sym.split(',')
    const tokenContract = market.underlying_symbol.contract
    const internalId = `${tokenContract}:${symbol}`
    const cgkId = tokenMapping[internalId]
    if (!cgkId) return

    sdk.util.sumSingleBalance(balances, `coingecko:${cgkId}`, totalBorrows)
  })

  return balances
}

async function getTotalStaking(api) {
  const [staked] = await getCurrencyBalance(LOAN_TOKEN_CONTRACT, STAKING_CONTRACT, 'LOAN')
  const [stakedAmount] = staked.split(' ');
  api.addCGToken('proton-loan', BigInt(Math.floor(stakedAmount)))
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL = only available liquidity (cash held by lending.loan). Borrowed = total variable + stable borrows (outstanding debt). Deposits = TVL + Borrowed, but we report liquidity as TVL per DefiLlama standards.',
  proton: {
    tvl,
    borrowed,
    staking: getTotalStaking
  }, 
}

