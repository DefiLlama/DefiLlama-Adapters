const { ibcChains, getUniqueAddresses} = require('./tokenMapping')
const { log,  } = require('./utils')
const { get, post, } = require('./http')
const { sumTokens2: sumTokensEVM, } = require('./unwrapLPs')
const sdk = require('@defillama/sdk')

const helpers = {
  "tron": require("./chain/tron"),
  "eos": require("./chain/eos"),
  "cardano":require("./chain/cardano"),
  "algorand":require("./chain/algorand"),
  "cosmos":require("./chain/cosmos"),
  "solana":require("./solana"),
  "aptos":require("./chain/aptos"),
  "tezos":require("./chain/tezos"),
  "zilliqa":require("./chain/zilliqa"),
  "near":require("./chain/near"),
  "bitcoin":require("./chain/bitcoin"),
  "litecoin":require("./chain/litecoin"),
  "polkadot":require("./chain/polkadot"),
  "hedera":require("./chain/hbar"),
}

const geckoMapping = {
  bep2: 'binancecoin',
  elrond: 'elrond-erd-2',
  ripple: 'ripple',
}

const specialChains = Object.keys(geckoMapping)

async function getBalance(chain, account) {
  switch (chain) {
    case 'ripple': return getRippleBalance(account)
    case 'elrond':
      return (await get(`https://gateway.elrond.com/address/${account}`)).data.account.balance / 1e18
    case 'bep2':
      // info: https://docs.bnbchain.org/api-swagger/index.html
      const balObject = (await get(`https://dex.binance.org/api/v1/account/${account}`)).balances.find(i => i.symbol === 'BNB')
      return +(balObject?.free ?? 0)
    default: throw new Error('Unsupported chain')
  }
}

function sumTokensExport(options) {
  const {chain} = options
  if (!chain) throw new Error('Missing chain info')
  return async (timestamp, _b, {[chain]: block}) => sumTokens({ timestamp, block, ...options})
}

async function sumTokens(options) {
  let { chain, owner, owners = [], tokens = [], tokensAndOwners = [], blacklistedTokens = [], balances = {}, } = options 

  if (!helpers[chain] && !specialChains.includes(chain))
    return sumTokensEVM(options)

  owners = getUniqueAddresses(owners, chain)
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
  let helper = helpers[chain]

  if (ibcChains.includes(chain)) helper = helpers.cosmos

  if(helper) {
    switch(chain) {
      case 'solana': return helper.sumTokens2(options)
      case 'eos': return helper.get_account_tvl(owners, tokens, 'eos')
      case 'tezos': options.includeTezos = true; break;
    }

    return helper.sumTokens(options)
  } else if (!specialChains.includes(chain)) {
    throw new Error('chain handler missing!!!')
  }

  const geckoId = geckoMapping[chain]
  const balanceArray = await Promise.all(owners.map(i => getBalance(chain, i)))
  sdk.util.sumSingleBalance(balances,geckoId,balanceArray.reduce((a, i) => a + +i, 0))
  return balances

  function getUniqueToA(toa, chain) {
    toa = toa.map(i => i.join('¤'))
    return getUniqueAddresses(toa, chain).map(i => i.split('¤'))
  }
}

async function getRippleBalance(account) {
  const body = { "method": "account_info", "params": [{ account }] }
  const res = await post('https://s1.ripple.com:51234', body)
  return res.result.account_data.Balance / 1e6
}

module.exports = {
  sumTokensExport,
  sumTokens,
}
