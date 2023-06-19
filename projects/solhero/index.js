const ADDRESSES = require('../helper/coreAssets.json')
const utils = require('../helper/utils')
const { getConnection } = require('../helper/solana')
const BigNumber = require('bignumber.js')
const { PublicKey } = require('@solana/web3.js')
const sdk = require('@defillama/sdk')

const poolInfoKey = new PublicKey('CsMSJ2wJAsQBNZU9LuL3FAx2Do9ndY4Ae15JAXhFMc1p')

const decimals = {
  'Hero6s7zJXsw9hfCXLVR5stLqgCok3E7CCkpQEoLAk2g': 6, // HERO
  [ADDRESSES.solana.SOL]: 9,  // SOL
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 6, // RAY
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 9,  // mSOL
  [ADDRESSES.solana.USDC]: 6, // USDC
  [ADDRESSES.solana.USDT]: 6, // USDT
  'rEmtKCiw6DQL8kAaGzhSryqnqNckYabPxTNXDdj2Jur': 6, // hero-usdc
  'Epm4KfTj4DMrvqn6Bwg2Tr2N8vhQuNbuK8bESFp4k33K': 9, // sol-usdt
  '8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu': 9, // sol-usdc
  '89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip': 6, // sol-ray
}

const poolTypes = {
  'rEmtKCiw6DQL8kAaGzhSryqnqNckYabPxTNXDdj2Jur': 0, // hero-usdc
  '8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu': 0, // sol-usdc,  0: lp, 1: token
  'Epm4KfTj4DMrvqn6Bwg2Tr2N8vhQuNbuK8bESFp4k33K': 0, // sol-usdt
  '89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip': 0, // ray-sol
}

const poolKeys = {
  'rEmtKCiw6DQL8kAaGzhSryqnqNckYabPxTNXDdj2Jur': { // hero-usdc
    'ammId': 'FJB4xeMJ9KoZVDZb7Pf91hggwy6hLJMQFXTMKCfugwU8',
  },
  '8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu': { // sol-usdc
    'ammId': '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
  },
  'Epm4KfTj4DMrvqn6Bwg2Tr2N8vhQuNbuK8bESFp4k33K': {  // sol-usdt
    'ammId': '7XawhbbxtsRcQA8KTkHT9f9nc6d69UwqCDh6U5EEbEmX',
  },
  '89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip': { // ray-sol
    'ammId': 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA',
  },
}

function isLp(token) {
  const addr = token.toString()
  if (poolTypes[addr] == 0)
    return true
  return false
}

var priceCache = new Map()

async function getTokenSupplyUI(mintPubkey) {
  const connection = getConnection()
  var supply = new BigNumber(0)

  const ret = await connection.getTokenSupply(mintPubkey)
  if (ret && ret.value && ret.value.uiAmountString)
    supply = new BigNumber(ret.value.uiAmountString)

  return supply
}

async function getLpPrice(tokenPubkey) {

  if (priceCache[tokenPubkey.toString()])
    return priceCache[tokenPubkey.toString()]

  const tokenAddress = tokenPubkey.toString()

  var price = new BigNumber(1.0)

  const keys = poolKeys[tokenAddress]
  if (!keys)
    return price;

  const ammId = keys['ammId']

  const prefix = 'https://api.solscan.io/amm/read?address='
  const url = prefix + ammId

  const res = await utils.fetchURL(url)
  if (res && res.data && res.data.success) {
    const tvl = new BigNumber(res.data.data.liquidity)

    const _tokenPubkey = new PublicKey(res.data.data.lpMint)
    const supply = await getTokenSupplyUI(_tokenPubkey)

    price = tvl.div(supply)

    priceCache[tokenPubkey.toString()] = price
  } else {
    sdk.log(res)
  }

  return price
}


async function getTokenPrice(tokenPubkey) {

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

async function getHeroPrice() {

  if (priceCache['Hero6s7zJXsw9hfCXLVR5stLqgCok3E7CCkpQEoLAk2g'])
    return priceCache['Hero6s7zJXsw9hfCXLVR5stLqgCok3E7CCkpQEoLAk2g']

  var price = new BigNumber(1.0)

  const url = 'https://api.solscan.io/amm/read?address=FJB4xeMJ9KoZVDZb7Pf91hggwy6hLJMQFXTMKCfugwU8'

  const res = await utils.fetchURL(url)
  if (res && res.data && res.data.data && res.data.data.price) {
    price = new BigNumber(res.data.data.price)
    priceCache['Hero6s7zJXsw9hfCXLVR5stLqgCok3E7CCkpQEoLAk2g'] = price
  }

  return price
}

async function getHeroLp() {
  var lpTvl = new BigNumber(0)

  const url = 'https://api.solscan.io/amm/read?address=FJB4xeMJ9KoZVDZb7Pf91hggwy6hLJMQFXTMKCfugwU8'

  const res = await utils.fetchURL(url)
  if (res && res.data && res.data.data && res.data.data.liquidity) {
    lpTvl = new BigNumber(res.data.data.liquidity)
  }

  return lpTvl
}

async function pools() {
  const connection = getConnection()
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)
  const poolLength = buffer.readBigUInt64LE(0)

  var amounts = []

  for (var i = 0; i < poolLength; i++) {
    if (i == 10)
      continue

    const offset = 8 + i * 104

    const pubkey = new PublicKey(buffer.subarray(offset, offset + 32))
    const dec = new BigNumber(10).pow(decimals[pubkey.toString()])
    const amount = buffer.readBigUInt64LE(offset + 40)

    const boost = 3
    amounts.push(new BigNumber(amount).times(boost).div(dec))
  }

  return {
    solana: amounts[1],
    raydium: amounts[2],
    'msol': amounts[3],
    'usd-coin': amounts[4],
    tether: amounts[5],
  }
}

async function staking() {

  const connection = getConnection()
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)

  var tvl = new BigNumber(0)

  var solPrice = await getTokenPrice(ADDRESSES.solana.SOL)

  var amounts = []

  const poolLength = buffer.readBigUInt64LE(0)
  for (var i = 0; i < poolLength; i++) {
    if (i != 0)
      continue

    const offset = 8 + i * 104

    const pubkey = new PublicKey(buffer.subarray(offset, offset + 32))
    const dec = new BigNumber(10).pow(decimals[pubkey.toString()])
    const amount = buffer.readBigUInt64LE(offset + 40)

    amounts.push(new BigNumber(amount).div(dec))

    var price = new BigNumber(1.0)
    if (i == 0)
      price = await getHeroPrice()
    else if (isLp(pubkey))
      price = await getLpPrice(pubkey)
    else
      price = await getTokenPrice(pubkey)

    //if (i == 1)
    //  solPrice = price

    const boost = 3
    const poolTvl = new BigNumber(amount).times(price).times(boost).div(dec)
    tvl = tvl.plus(poolTvl)
  }

  tvl = tvl.div(solPrice)

  return {
    solana: tvl
  }
}

async function farmPool() {

  const connection = getConnection()
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)

  var tvl = new BigNumber(0)

  var solPrice = await getTokenPrice(ADDRESSES.solana.SOL)

  var amounts = []

  const poolLength = buffer.readBigUInt64LE(0)
  for (var i = 0; i < poolLength; i++) {

    const offset = 8 + i * 104

    const pubkey = new PublicKey(buffer.subarray(offset, offset + 32))
    const dec = new BigNumber(10).pow(decimals[pubkey.toString()])
    const amount = buffer.readBigUInt64LE(offset + 40)

    amounts.push(new BigNumber(amount).div(dec))

    var price = new BigNumber(1.0)
    if (i == 0)
      price = await getHeroPrice()
    else if (isLp(pubkey))
      price = await getLpPrice(pubkey)
    else
      price = await getTokenPrice(pubkey)

    if (i == 1)
      solPrice = price

    const boost = 3
    const poolTvl = new BigNumber(amount).times(price).times(boost).div(dec)
    tvl = tvl.plus(poolTvl)
  }

  tvl = tvl.div(solPrice)

  return {
    solana: tvl
  }
}

async function lpTvl() {
  const connection = getConnection()
  const poolInfoAccount = await connection.getAccountInfo(poolInfoKey)

  const buffer = Buffer.from(poolInfoAccount.data)

  var tvl = new BigNumber(0)

  var solPrice = await getTokenPrice(ADDRESSES.solana.SOL)
  var lpTvl = await getHeroLp()

  lpTvl = lpTvl.div(solPrice)

  return {
    solana: lpTvl
  }
}

async function tvl() {
  const [pool, farm] = await Promise.all([
    pools(),
    farmPool(),
  ]);

  pool.solana = (pool.solana).plus(farm.solana)

  return pool
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    pool2: lpTvl,
    staking,
  },
  methodology: 'TVL consists of staked tokens and raydium LPs',
}
