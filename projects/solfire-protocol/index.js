const utils = require('../helper/utils')
const BigNumber = require('bignumber.js')
const { Connection, PublicKey } = require('@solana/web3.js')

//const url = 'https://www.solfire.finance/api/tvl.json'

async function getTokenPrice(tokenPubkey)
{
  var price = new BigNumber(1.0)

  try {
    const prefix = 'https://public-api.solscan.io/market/token/'
    const url = prefix + tokenPubkey.toString()

    const res = await utils.fetchURL(url)
    //console.log(res)

    if (res && res.data && res.data.priceUsdt)
      price = new BigNumber(res.data.priceUsdt)
  } catch (e) {
    console.log(e)
  }

  return price
}

async function getFirePrice()
{
  var price = new BigNumber(1.0)

  try {
    url = 'https://api.solscan.io/amm/read?address=E4LrqfBsPX4MdgoW7gF3rCW8Hn5eV2cPyTR4d1z4AwZU'

    const res = await utils.fetchURL(url)
    //console.log(res.data.data)
    if (res && res.data && res.data.data && res.data.data.price) {
      price = new BigNumber(res.data.data.price)
      lpTvl = new BigNumber(res.data.data.liquidity)
    }

    //console.log(res.data)
  } catch (e) {
    console.log(e)
  }

  return price
}

async function getFireLp()
{
  var lpTvl = new BigNumber(0)

  try {
    url = 'https://api.solscan.io/amm/read?address=E4LrqfBsPX4MdgoW7gF3rCW8Hn5eV2cPyTR4d1z4AwZU'

    const res = await utils.fetchURL(url)
    //console.log(res.data.data)
    if (res && res.data && res.data.data && res.data.data.price) {
      lpTvl = new BigNumber(res.data.data.liquidity)
    }

    //console.log(res.data)
  } catch (e) {
    console.log(e)
  }

  return lpTvl
}

const decimals = {
  '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': 6, // eth
  'So11111111111111111111111111111111111111112': 9, // sol
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 6, // btc
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6, // usdc
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 6, // usdt
  'AfXLBfMZd32pN6QauazHCd7diEWoBgw1GNUALDw3suVZ': 6, // fire
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 9, // msol
  'F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W': 6, // luna
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 6, //ray
  'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': 6, //srm
  'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1': 6, //sbr
}

async function pools(){
  //const result = await utils.fetchURL(url)
  //return {solana: new BigNumber(result.data.tvl)}

  const connection = new Connection('https://solana-api.projectserum.com');
  const poolInfoKey = new PublicKey('8YDHyFieasunzaxyu1n2NURHowdoEVuEz72hriy7vuWj')
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)

  var tvl = new BigNumber(0)

  var solPrice = new BigNumber(1)
  var filePrice = new BigNumber(0.01)

  var amounts = []

  const poolLength = buffer.readBigUInt64LE(0)

  for (var i = 0; i < poolLength; i ++) {
    const offset = 8 + i * 96

    const pubkey = new PublicKey(buffer.subarray(offset, offset + 32))
    const dec = new BigNumber(10).pow(decimals[pubkey.toString()])
    const amount = buffer.readBigUInt64LE(offset + 40)

    amounts.push(new BigNumber(amount).times(3).div(dec))

    var price = new BigNumber(1.0)
    if (i == 5)
      price = await getFirePrice()
    else
      price = await getTokenPrice(pubkey)

    if (i == 1)
      solPrice = price
    else if (i == 5)
      firePrice = price

    const poolTvl = new BigNumber(amount).times(3).times(price).div(dec)
    tvl = tvl.plus(poolTvl)
  }

  tvl = tvl.div(solPrice)
  lpTvl = lpTvl.div(solPrice)

  return {
    ethereum: amounts[0],
    solana: amounts[1],
    bitcoin: amounts[2],
    'usd-coin': amounts[3],
    tether: amounts[4],
    'msol': amounts[6],
    'terra-luna': amounts[7],
    raydium: amounts[8],
    serum: amounts[9],
    saber: amounts[10],
  }
}

async function firepool() {
  //const result = await utils.fetchURL(url)
  //return {solana: new BigNumber(result.data.tvl)}

  const connection = new Connection('https://solana-api.projectserum.com');
  const poolInfoKey = new PublicKey('8YDHyFieasunzaxyu1n2NURHowdoEVuEz72hriy7vuWj')
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)

  var tvl = new BigNumber(0)

  var filePrice = new BigNumber(0.01)
  var solPrice = await getTokenPrice('So11111111111111111111111111111111111111112')

  var amounts = []

  const poolLength = buffer.readBigUInt64LE(0)

  for (var i = 0; i < poolLength; i ++) {
    const offset = 8 + i * 96

    const pubkey = new PublicKey(buffer.subarray(offset, offset + 32))
    const dec = new BigNumber(10).pow(decimals[pubkey.toString()])
    const amount = buffer.readBigUInt64LE(offset + 40)

    amounts.push(new BigNumber(amount).times(3).div(dec))

    var price = new BigNumber(1.0)
    if (i == 5)
      price = await getFirePrice()
    else
      price = await getTokenPrice(pubkey)

    if (i == 1)
      solPrice = price
    else if (i == 5)
      firePrice = price

    const poolTvl = new BigNumber(amount).times(3).times(price).div(dec)
    tvl = tvl.plus(poolTvl)
  }

  tvl = tvl.div(solPrice)
  lpTvl = lpTvl.div(solPrice)

  return {
    solana: tvl
  }
}

async function lpTvl() {
  //const result = await utils.fetchURL(url)
  //return {solana: new BigNumber(result.data.tvl)}

  const connection = new Connection('https://solana-api.projectserum.com');
  const poolInfoKey = new PublicKey('8YDHyFieasunzaxyu1n2NURHowdoEVuEz72hriy7vuWj')
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)

  var tvl = new BigNumber(0)

  var solPrice = await getTokenPrice('So11111111111111111111111111111111111111112')
  var lpTvl = await getFireLp()

  lpTvl = lpTvl.div(solPrice)

  return {
    solana: lpTvl
  }
}

async function tvl()
{
  const connection = new Connection('https://solana-api.projectserum.com');
  const poolInfoKey = new PublicKey('8YDHyFieasunzaxyu1n2NURHowdoEVuEz72hriy7vuWj')
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)

  var tvl = new BigNumber(0)

  var solPrice = new BigNumber(1)
  var filePrice = new BigNumber(0.01)

  var amounts = []

  const poolLength = buffer.readBigUInt64LE(0)

  for (var i = 0; i < poolLength; i ++) {
    const offset = 8 + i * 96

    const pubkey = new PublicKey(buffer.subarray(offset, offset + 32))
    const dec = new BigNumber(10).pow(decimals[pubkey.toString()])
    const amount = buffer.readBigUInt64LE(offset + 40)

    amounts.push(new BigNumber(amount).times(3).div(dec))

    var price = new BigNumber(1.0)
    if (i == 5)
      price = await getFirePrice()
    else
      price = await getTokenPrice(pubkey)

    if (i == 1)
      solPrice = price
    else if (i == 5)
      firePrice = price

    const poolTvl = new BigNumber(amount).times(3).times(price).div(dec)
    tvl = tvl.plus(poolTvl)
  }

  tvl = tvl.div(solPrice)

  var lpTvl = new BigNumber(0)
  try {
    url = 'https://api.solscan.io/amm/read?address=E4LrqfBsPX4MdgoW7gF3rCW8Hn5eV2cPyTR4d1z4AwZU'

    const res = await utils.fetchURL(url)
    //console.log(res.data.data)
    if (res && res.data && res.data.data && res.data.data.price) {
      lpTvl = new BigNumber(res.data.data.liquidity)
    }

    //console.log(res.data)
  } catch (e) {
    console.log(e)
  }

  lpTvl = lpTvl.div(solPrice)

  return {
    solana: tvl.plus(lpTvl),
  }
}

module.exports = {
  deadFrom: 1648765747,
  solana: {
    pool2: lpTvl,
    tvl,
  },
  methodology: 'TVL consists of deposits made to the protocol',
}
