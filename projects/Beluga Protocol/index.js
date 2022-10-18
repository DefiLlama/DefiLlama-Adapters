const BigNumber = require('bignumber.js')
const { Connection, PublicKey } = require('@solana/web3.js')
const utils = require('../helper/utils')

function getConnection()
{
  return new Connection('https://solana-api.projectserum.com')
}

const farmPubKey = new PublicKey('B6VyNg4Zch44e4TfzAJspzpAMC2wwferezdXNWBqWEEs')

const poolLpTokens = [
  ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB','EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'], // 2usd
]

const symbolTable = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
  'So11111111111111111111111111111111111111112': 'solana',
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'msol',
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'lido-staked-sol',
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 'bitcoin',
}

var priceCache = new Map()
async function fetchCoinPrice(tokenPubkey)
{
  //console.log('fetchCoinPrice(' + tokenPubkey.toString() + ')')

  if (tokenPubkey.toString() == '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj')
    return await getNativeCoinPrice()

  if (priceCache[tokenPubkey.toString()])
    return priceCache[tokenPubkey.toString()]

  var price = new BigNumber(1.0)

  const prefix = 'https://public-api.solscan.io/market/token/'
  const url = prefix + tokenPubkey.toString()

  const res = await utils.fetchURL(url)
  if (res && res.data && res.data.priceUsdt) {
    price = new BigNumber(res.data.priceUsdt)
    priceCache[tokenPubkey.toString()] = price
  }

  return price
}
async function getNativeCoinPrice()
{
  let token = 'So11111111111111111111111111111111111111112'
  var price = new BigNumber(30.96)

  const prefix = 'https://public-api.solscan.io/market/token/'
  const url = prefix + token

  const res = await utils.fetchURL(url)
  if (res && res.data && res.data.priceUsdt)
    price = new BigNumber(res.data.priceUsdt)

  return price
}

async function tvl() {
  const account = await getConnection().getAccountInfo(farmPubKey)

  const buffer = account.data
  let tvls = { }

  for (let i in poolLpTokens) {
    if (i == 1)
      continue

    const xu = buffer.readBigInt64LE(8 + i * 32)
    const pu = new BigNumber(xu).div(1000)

    const coins = poolLpTokens[i]
    for (let token of coins) {
      const u = pu.div(coins.length)
      const price = await fetchCoinPrice(new PublicKey(token))
      const amount = u.div(price)
      if (tvls[symbolTable[token]])
        tvls[symbolTable[token]] = tvls[symbolTable[token]].plus(amount)
      else
        tvls[symbolTable[token]] = amount
    }
  }

  return tvls
}

module.exports = {
  timetravel: false, 
  solana: {
    tvl,
  },
  methodology: 'TVL consists of staked tokens',
}
