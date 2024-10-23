const ADDRESSES = require('../coreAssets.json')
const { get } = require('../http')
const { transformBalances } = require('../portedTokens')
const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { getEnv } = require('../env')
const { getUniqueAddresses, sleep } = require('../utils')
const { default: PromisePool } = require('@supercharge/promise-pool')

const call = async ({ target, abi, params = [], responseTypes = [] }) => {
  const data = await post(getEnv('MULTIVERSX_RPC') + '/query', { scAddress: target, funcName: abi, args: params, })

  const response = data.returnData.map(parseResponses)
  return responseTypes.length === 1 ? response[0] : response

  // https://github.com/multiversx/mx-sdk-js-core/blob/main/src/smartcontracts/resultsParser.ts
  function parseResponses(item, idx) {
    const buffer = Buffer.from(item || "", "base64")
    switch (responseTypes[idx]) {
      case 'number': return parseNumber(buffer)
      default: throw new Error('Unknown/unsupported data type')
    }
  }

  function parseNumber(buffer) {
    // https://github.com/juanelas/bigint-conversion/blob/master/src/ts/index.ts#L63
    buffer = new Uint8Array(buffer)
    let bits = 8n

    let ret = 0n
    for (const i of buffer.values()) {
      const bi = BigInt(i)
      ret = (ret << bits) + bi
    }
    return ret.toString()
  }
};

const chain = 'elrond'

async function getElrondBalance(address) {
  const { data: { account: { balance } } } = await get(`${getEnv('MULTIVERSX_RPC')}/address/${address}`)
  return balance
}
const nullAddress = ADDRESSES.null

async function getTokens({ address, balances = {}, tokens = [], blacklistedTokens = [], whitelistedTokens = [], }) {
  const res = await get(`${getEnv('MULTIVERSX_RPC')}/accounts/${address}/tokens?size=1000`)
  res.filter(i => i.type === 'FungibleESDT')
    .forEach(i => {
      const token = i.identifier
      if (tokens.length && !tokens.includes(token)) return; // sum only whitelistedTokens
      if (whitelistedTokens.length && !whitelistedTokens.includes(token)) return; // sum only whitelistedTokens
      if (blacklistedTokens.includes(token)) return; // skip blacklisted tokens
      return sdk.util.sumSingleBalance(balances, token, i.balance, chain)
    })
  return balances
}

async function sumTokens({ owner, owners = [], tokens = [], balances = {}, blacklistedTokens = [], tokensAndOwners = [], whitelistedTokens = [] }) {
  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners, true)
  if (tokensAndOwners.length) {
    await Promise.all(tokensAndOwners.map(([token, owner]) => sumTokens({ owners: [owner], tokens: [token], balances, blacklistedTokens, whitelistedTokens, })))
    return balances
  }
  
  const { errors } = await PromisePool
    .withConcurrency(5)
    .for(owners)
    .process(async i => {
      await getTokens({ address: i, balances, tokens, blacklistedTokens, whitelistedTokens, })
      if (owners.length > 10) await sleep(5000)
    })

  if (errors.length) throw errors[0]

  if ((!tokens.length || tokens.includes(nullAddress)) && (!whitelistedTokens.length || whitelistedTokens.includes(nullAddress)) && (!blacklistedTokens.length || !blacklistedTokens.includes(nullAddress))) {

    const { errors } = await PromisePool
      .withConcurrency(5)
      .for(owners)
      .process(async i => {
        const bal = await getElrondBalance(i)
        sdk.util.sumSingleBalance(balances, nullAddress, bal, chain)
        if (owners.length > 10) await sleep(5000)
      })

    if (errors.length) throw errors[0]
  }
  return transformBalances(chain, balances)
}

async function getNFTs(address) {
  const res = await get(`${getEnv('MULTIVERSX_RPC')}/accounts/${address}/nfts?size=1000`)
  return res
}

async function getTokenData(token) {
  const data = await get(`https://api.multiversx.com/tokens/${token}`)
  return data
}

function sumTokensExport(...args) {
  return () => sumTokens(...args)
}

module.exports = {
  sumTokens,
  call,
  getNFTs,
  getTokenData,
  sumTokensExport,
}