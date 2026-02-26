const { ibcChains, getUniqueAddresses } = require('./tokenMapping')
const { get, post, } = require('./http')
const { sumTokens2: sumTokensEVM, nullAddress, } = require('./unwrapLPs')
const sdk = require('@defillama/sdk')
const { RateLimiter } = require("limiter");


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const helpers = {
  "eos": require("./chain/eos"),
  "ton": require("./chain/ton"),
  "ergo": require("./chain/ergo"),
  "elrond": require("./chain/elrond"),
  "cardano": require("./chain/cardano"),
  "algorand": require("./chain/algorand"),
  "cosmos": require("./chain/cosmos"),
  "solana": require("./solana"),
  "aptos": require("./chain/aptos"),
  "sui": require("./chain/sui"),
  "tezos": require("./chain/tezos"),
  "zilliqa": require("./chain/zilliqa"),
  "near": require("./chain/near"),
  "bitcoin": require("./chain/bitcoin"),
  "litecoin": require("./chain/litecoin"),
  "polkadot": require("./chain/polkadot"),
  "acala": require("./chain/acala"),
  "bifrost": require("./chain/bifrost"),
  "aelf": require("./chain/aelf"),
  "aeternity": require("./chain/aeternity"),
  "alephium": require("./chain/alephium"),
  "hedera": require("./chain/hbar"),
  "stacks": require("./chain/stacks"),
  "starknet": require("./chain/starknet"),
  "brc20": require("./chain/brc20"),
  "doge": require("./chain/doge"),
  "bittensor": require("./chain/bittensor"),
  "fuel": require("./chain/fuel"),
  "radixdlt": require("./chain/radixdlt"),
  "stellar": require("./chain/stellar"),
}


// some chains support both evm & non-evm, this is to handle if address provided is not evm
const altEVMHelper = {
  "astar": require("./chain/astar"),
  "evmos": helpers.cosmos,
}

const geckoMapping = {
  bep2: 'binancecoin',
  ripple: 'ripple',
}

const specialChains = Object.keys(geckoMapping)

async function getBalance(chain, account) {
  switch (chain) {
    case 'ripple': return getRippleBalance(account)
    case 'bep2':
      // info: https://docs.bnbchain.org/api-swagger/index.html
      const balObject = (await get(`https://dex.binance.org/api/v1/account/${account}`)).balances.find(i => i.symbol === 'BNB')
      return +(balObject?.free ?? 0)
    default: throw new Error('Unsupported chain')
  }
}

function sumTokensExport(options) {
  return async (api) => sumTokens(
    { ...api, api, ...options }
  )
}

async function sumTokens(options) {
  let { chain, owner, owners = [], tokens = [], tokensAndOwners = [], blacklistedTokens = [], balances = {}, token, api } = options
  if (api && !specialChains.includes(chain)) {
    chain = api.chain
  }
  if (chain === 'bsc' && (owners[0] ?? '').startsWith('bnb')) chain = 'bep2'

  if (token) tokens = [token]
  if (owner) owners = [owner]
  const evmAddressExceptions = new Set(['tron', 'xdc'])
  const nonEvmOwnerFound = !evmAddressExceptions.has(chain) && owners.some(o => !o.startsWith('0x'))
  const isAltEvm = altEVMHelper[chain] && nonEvmOwnerFound

  if (!ibcChains.includes(chain) && !helpers[chain] && !specialChains.includes(chain) && !isAltEvm) {
    if (nonEvmOwnerFound) throw new Error('chain handler missing: ' + chain)
    return sumTokensEVM(options)
  }


  if (!isAltEvm)
    owners = getUniqueAddresses(owners, chain)
  else
    owners = [...new Set(owners)] // retain case sensitivity

  blacklistedTokens = getUniqueAddresses(blacklistedTokens, chain)
  if (!['eos'].includes(chain))
    tokens = getUniqueAddresses(tokens, chain).filter(t => !blacklistedTokens.includes(t))

  if (!tokensAndOwners.length) {
    if (!owners.length && owner)
      owners = [owner]

    tokensAndOwners = tokens.map(t => owners.map(o => ([t, o]))).flat()
  }

  options.tokensAndOwners = getUniqueToA(tokensAndOwners, chain)
  options.owners = owners
  options.tokens = tokens
  options.blacklistedTokens = blacklistedTokens
  let helper = helpers[chain] || altEVMHelper[chain]

  if (ibcChains.includes(chain) && nonEvmOwnerFound) helper = helpers.cosmos

  if (helper) {
    switch (chain) {
      case 'cardano':
      case 'solana': return helper.sumTokens2(options)
      case 'eos': return helper.get_account_tvl(owners, tokens, 'eos')
      case 'tezos': options.includeTezos = true; break;
    }

    const balances = await helper.sumTokens(options)

    if (chain === 'bitcoin' && options.includeBRC20) {
      options.balances = balances
      return helpers.brc20.sumTokens(options)
    }
    return balances

  } else if (!specialChains.includes(chain)) {
    if (ibcChains.includes(chain)) return sumTokensEVM(options)
    throw new Error('chain handler missing!!!')
  }

  const geckoId = geckoMapping[chain]
  const balanceArray = await Promise.all(owners.map(i => getBalance(chain, i)))
  sdk.util.sumSingleBalance(balances, geckoId, balanceArray.reduce((a, i) => a + +i, 0))
  return balances

  function getUniqueToA(toa, chain) {
    toa = toa.map(i => i.join('¤'))
    return getUniqueAddresses(toa, chain).map(i => i.split('¤'))
  }
}

// limit it to 3 calls every 5 seconds
const rippleApiLimiter = new RateLimiter({ tokensPerInterval: 3, interval: 5_000 });
const rippleApiWithLimiter = (fn, tokensToRemove = 1) => async (...args) => {
  await rippleApiLimiter.removeTokens(tokensToRemove);
  return fn(...args);
}

const getRippleBalance = rippleApiWithLimiter(_getRippleBalance)

async function _getRippleBalance(account) {
  const body = { "method": "account_info", "params": [{ account }] }
  await sleep(500);
  const res = await post('https://s1.ripple.com:51234', body)
  if (res.result.error === 'actNotFound') return 0
  return res.result.account_data.Balance / 1e6
}

async function addRippleTokenBalance({ account, api, whitelistedTokens }) {

  if (Array.isArray(whitelistedTokens) && whitelistedTokens.length)
    whitelistedTokens = new Set(whitelistedTokens.map(i => i.toLowerCase()))
  const body = {
    "method": "account_lines",
    "params": [{
      account,
      ledger_index: "validated"
    }]
  }
  await sleep(500);
  const res = await post('https://s1.ripple.com:51234', body)
  if (res.result.error === 'actNotFound') return {}


  // Add token balances
  if (res.result.lines) {
    res.result.lines.forEach(line => {
      const tokenKey = `${line.currency}.${line.account}`
      if (whitelistedTokens && !whitelistedTokens.has(tokenKey.toLowerCase())) return;
      api.add(tokenKey, parseFloat(line.balance))
    })
  }

  return api.getBalances()
}

module.exports = {
  nullAddress,
  sumTokensExport,
  sumTokens,
  addRippleTokenBalance,
}
