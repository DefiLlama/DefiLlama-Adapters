const BigNumber = require('bignumber.js')
const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const utils = require('../helper/utils')

const programInfoKey = new PublicKey('4GmnzdmugEG4EcwqV5PqEYNsEpXR7KHHFjdUR581383U')

const stratTokens = [
  ['So11111111111111111111111111111111111111112', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'],   // ray lp: sol-usdc
  ['So11111111111111111111111111111111111111112', 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'],   // ray lp: sol-usdt
  ['4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', 'So11111111111111111111111111111111111111112'],   // ray lp: ray-sol
  ['4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'],  // ray lp: ray-usdc
  ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'], // larix USDT
  ['So11111111111111111111111111111111111111112'],  // larix SOL
  ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'],  // larix mSOL
  ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'], // larix USDC
  ['9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'], // larix btc
  [''],
  ['2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'], // larix eth
]

const tokenMaps = {
  'So11111111111111111111111111111111111111112': 'solana',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'raydium',
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'msol',
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 'bitcoin',
  '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': 'ethereum',
}

var priceCache = new Map()
async function getTokenPrice(tokenPubkey)
{
  //console.log('getTokenPrice(' + tokenPubkey.toString() + ')')

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
async function getSolPrice()
{
  let tokenPubkey = 'So11111111111111111111111111111111111111112'
  var price = new BigNumber(80.0)

  const prefix = 'https://public-api.solscan.io/market/token/'
  const url = prefix + tokenPubkey

  const res = await utils.fetchURL(url)
  if (res && res.data && res.data.priceUsdt)
    price = new BigNumber(res.data.priceUsdt)

  return price
}

async function tvl() {
  const stratInfo = await getConnection().getAccountInfo(programInfoKey)

  const buffer = stratInfo.data
  let tvls = { }

  for (let i in stratTokens) {
    if (i == 9)
      continue

    const xu = buffer.readBigInt64LE(8 + i * 32)
    const pu = new BigNumber(xu).div(1000)
	   
    for (let token of stratTokens[i]) {
      const u = pu.div(stratTokens[i].length)
      const price = await getTokenPrice(new PublicKey(token))
      const amount = u.div(price)
      if (tvls[tokenMaps[token]])
        tvls[tokenMaps[token]] = tvls[tokenMaps[token]].plus(amount)
      else
        tvls[tokenMaps[token]] = amount
    }
  }

  return tvls
}

module.exports = {
  timetravel: false, 
  solana: {
    tvl,
  },
  methodology: 'TVL consists of staked tokens and ray-lps, saber-lps',
}
