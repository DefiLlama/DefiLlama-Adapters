const ADDRESSES = require('../coreAssets.json')
const axios = require('axios')
const BigNumber = require('bignumber.js')
const ethers = require('ethers')
const sdk = require('@defillama/sdk')
const { getUniqueAddresses, } = require('../utils')
const { get, } = require('../http')
const { transformBalances, } = require('../portedTokens')
const { toHex, fromHex, } = require('tron-format-address')
const axiosObj = axios.create({
  baseURL: 'https://api.trongrid.io/',
  headers: {
    'TRON-PRO-API-KEY': 'b5681c79-7e8e-4dcc-a290-86b4eb95157b',
    'Content-Type': 'application/json'
  },
  timeout: 300000,
})

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";
const accountData = {
}

async function getStakedTron(account) {
  const data = await get(`https://apilist.tronscan.org/api/vote?candidate=${account}`)
  return data.totalVotes
}

async function getAccountDetails(account) {
  if (!accountData[account])
    accountData[account] = get('https://apilist.tronscan.org/api/account?address=' + account)
  return accountData[account]
}

function encodeParams(inputs) {
  let typesValues = inputs
  let parameters = ''

  if (typesValues.length == 0)
    return parameters
  const abiCoder = new AbiCoder();
  let types = [];
  const values = [];

  for (let i = 0; i < typesValues.length; i++) {
    let { type, value } = typesValues[i];
    if (type == 'address')
      value = value.replace(ADDRESS_PREFIX_REGEX, '0x');
    else if (type == 'address[]')
      value = value.map(v => toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'));
    types.push(type);
    values.push(value);
  }

  return abiCoder.encode(types, values).replace(/^(0x)/, '');
}

function decodeParams({types, output, ignoreMethodHash}) {
  if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
    output = '0x' + output.replace(/^0x/, '').substring(8);

  const abiCoder = new AbiCoder();

  if (output.replace(/^0x/, '').length % 64)
    throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
  return abiCoder.decode(types, output).reduce((obj, arg, index) => {
    if (types[index] == 'address')
      arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
    obj.push(arg);
    return obj;
  }, []);
}

// api reference: https://developers.tron.network/reference
const owner_address = ADDRESSES.tron.USDT

async function unverifiedCall({ target, abi, parameter = [], isBigNumber, types = [], isAddress }) {
  var body = {
    owner_address: owner_address,
    contract_address: target,
    function_selector: abi,
    parameter: encodeParams(parameter),
    visible: true,
  };
  const axiosResponse = await axiosObj.post('/wallet/triggerconstantcontract', body)
  if (isBigNumber)
    return BigNumber("0x" + axiosResponse.data['constant_result'][0])
  if (isAddress) {
    const str = '0x' + axiosResponse.data.constant_result[0].replace(/^(0+)/, '')
    return fromHex(str)
  }
  return decodeParams({ types, output: axiosResponse.data.constant_result[0], ignoreMethodHash: true })
}

async function multicall({ calls, ...options }) {
  const res = []
  for (const target of calls)
    res.push(await unverifiedCall({ target, ...options }))
  return res
}

async function getUnverifiedTokenBalance(token, account) {
  const data = await getAccountDetails(account)
  const bal = data.trc20token_balances.find(i => i.tokenId === token)?.balance ?? 0
  return BigNumber(bal)
}

async function getTokenDecimals(token, account) {
  const data = await getAccountDetails(account)
  return data.trc20token_balances.find(i => i.tokenId === token)?.tokenDecimal ?? 0
}

async function getTokenBalance(token, account) {
  const [balance, decimals] = await Promise.all([
    getUnverifiedTokenBalance(token, account),
    getTokenDecimals(token, account)
  ]);
  return Number(balance.toString()) / (10 ** decimals)
}

async function getTrxBalance(account) {
  const data = await getAccountDetails(account)
  return data.balance + (data.totalFrozen || 0)
}

const nullAddress = ADDRESSES.null
const gasTokens = [nullAddress, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee']

async function sumTokens({
  balances = {},
  tokensAndOwners = [],
  tokens = [],
  owners = [],
  owner,
  blacklistedTokens = [],
}) {
  if (!tokensAndOwners.length) {
    tokens = getUniqueAddresses(tokens, true)
    owners = getUniqueAddresses(owners, true)
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }
  tokensAndOwners = tokensAndOwners.filter(([token]) => !blacklistedTokens.includes(token))
  tokensAndOwners = getUniqueToA(tokensAndOwners)

  let tronBalanceInputs = []

  tokensAndOwners = tokensAndOwners.filter(i => {
    const token = i[0]
    if (token !== nullAddress && !gasTokens.includes(token))
      return true
    tronBalanceInputs.push(i[1])
    return false
  })
  tronBalanceInputs = getUniqueAddresses(tronBalanceInputs, true)

  if (tronBalanceInputs.length) {
    const bals = await Promise.all(tronBalanceInputs.map(getTrxBalance))
    bals.forEach(balance => sdk.util.sumSingleBalance(balances, nullAddress, balance))
  }

  const results = await Promise.all(tokensAndOwners.map(i => getUnverifiedTokenBalance(i[0], i[1])))

  results.forEach((bal, i) => sdk.util.sumSingleBalance(balances, 'tron:' + tokensAndOwners[i][0], bal.toFixed(0)))
  return transformBalances('tron', balances)

  function getUniqueToA(toa) {
    toa = toa.map(i => i.join('-'))
    return getUniqueAddresses(toa, true).map(i => i.split('-'))
  }
}

module.exports = {
  multicall,
  getTokenBalance,
  getTrxBalance,
  unverifiedCall,
  sumTokens,
  getStakedTron,
}
