const ADDRESSES = require('./coreAssets.json')
const BigNumber = require("bignumber.js");
const axios = require("axios");
const sdk = require('@defillama/sdk')
const http = require('./http')
const { getEnv } = require('./env')
const erc20 = require('./abis/erc20.json')

async function returnBalance(token, address, block, chain) {
  const { output: decimals } = await sdk.api.erc20.decimals(token, chain)
  let { output: balance } = await sdk.api.erc20.balanceOf({ target: token, owner: address, chain, block })
  balance = await new BigNumber(balance).div(10 ** decimals).toFixed(2);
  return parseFloat(balance);
}

async function returnEthBalance(address) {
  const output = await sdk.api.eth.getBalance({ target: address })
  let ethAmount = await new BigNumber(output.output).div(10 ** 18).toFixed(2);
  return parseFloat(ethAmount);
}

async function fetchURL(url) {
  return axios.get(url)
}

async function postURL(url, data) {
  return axios.post(url, data)
}

function createIncrementArray(length) {
  const arr = []
  for (let i = 0; i < length; i++)
    arr.push(i)

  return arr
}

function getParamCalls(length) {
  return createIncrementArray(length).map(i => ({ params: i }))
}

const LP_SYMBOLS = ['SLP', 'spLP', 'JLP', 'OLP', 'SCLP', 'DLP', 'MLP', 'MSLP', 'ULP', 'TLP', 'HMDX', 'YLP', 'SCNRLP', 'PGL', 'GREEN-V2', 'PNDA-V2', 'vTAROT', 'vEvolve', 'TETHYSLP', 'BAO-V2', 'DINO-V2', 'DFYNLP', 'LavaSwap', 'RLP', 'ZDEXLP', 'lawSWAPLP', 'ELP', 'ICELP', 'LFG_LP', 'KoffeeMug']
const blacklisted_LPS = new Set([
  '0xb3dc4accfe37bd8b3c2744e9e687d252c9661bc7',
  '0xf146190e4d3a2b9abe8e16636118805c628b94fe',
  '0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25',
  '0xaee4164c1ee46ed0bbc34790f1a3d1fc87796668',
  '0x93669cfce302c9971169f8106c850181a217b72b',
  '0x253f67aacaf0213a750e3b1704e94ff9accee10b',
  '0x524cab2ec69124574082676e6f654a18df49a048',
].map(i => i.toLowerCase()))

function isICHIVaultToken(symbol, token, chain) {
  if (symbol === 'ICHI_Vault_LP') return true
  if (chain === 'bsc' && symbol.startsWith('IV-') && symbol.endsWith('-THE')) return true
  return false
}

function isLP(symbol, token, chain) {
  // sdk.log(symbol, chain, token)
  if (!symbol) return false
  if (token && blacklisted_LPS.has(token.toLowerCase()) || symbol.includes('HOP-LP-')) return false
  if (chain === 'bsc' && ['OLP', 'DLP', 'MLP', 'LP', 'Stable-LP', 'fCake-LP', 'fMDEX LP'].includes(symbol)) return false
  if (chain === 'bsc' && ['WLP', 'FstLP', 'BLP', 'DsgLP'].includes(symbol)) return true
  if (chain === 'pulse' && ['PLP', 'PLT'].includes(symbol)) return true
  if (chain === 'avax' && ['ELP', 'EPT', 'CRL', 'YSL', 'BGL', 'PLP'].includes(symbol)) return true
  if (chain === 'ethereum' && ['SSLP'].includes(symbol)) return true
  if (chain === 'moonriver' && ['HBLP'].includes(symbol)) return true
  if (chain === 'ethpow' && ['LFG_LP'].includes(symbol)) return true
  if (chain === 'aurora' && ['wLP'].includes(symbol)) return true
  if (chain === 'oasis' && ['LPT'].includes(symbol)) return true
  if (chain === 'base' && ['RCKT-V2'].includes(symbol)) return true
  if (chain === 'wan' && ['WSLP'].includes(symbol)) return true
  if (chain === 'telos' && ['zLP'].includes(symbol)) return true
  if (chain === 'polygon' && ['MbtLP', 'GLP', 'WLP', 'FLP'].includes(symbol)) return true
  if (chain === 'polygon' && ['DLP'].includes(symbol)) return false
  if (chain === 'ethereum' && (['SUDO-LP'].includes(symbol) || symbol.endsWith('LP-f'))) return false
  if (chain === 'dogechain' && ['DST-V2'].includes(symbol)) return true
  if (chain === 'harmony' && ['HLP'].includes(symbol)) return true
  if (chain === 'klaytn' && ['NLP'].includes(symbol)) return true
  if (chain === 'core' && ['GLP'].includes(symbol)) return true
  if (chain === 'kardia' && ['KLP', 'KDXLP'].includes(symbol)) return true
  if (chain === 'fantom' && ['HLP', 'WLP'].includes(symbol)) return true
  if (chain === 'functionx' && ['FX-V2'].includes(symbol)) return true
  if (chain === 'mantle' && ['MoeLP'].includes(symbol)) return true
  if (chain === 'blast' && ['RING-V2'].includes(symbol)) return true
  if (chain === 'fraxtal' && ['FS-V2'].includes(symbol)) return true
  if (chain === 'era' && /(ZFLP)$/.test(symbol)) return true // for syncswap
  if (chain === 'flare' && symbol.endsWith('_LP')) return true // for enosys dex
  if (chain === 'songbird' && ['FLRX', 'OLP'].includes(symbol)) return true
  if (chain === 'arbitrum' && ['DXS', 'ZLP',].includes(symbol)) return true
  if (chain === 'metis' && ['NLP', 'ALP'].includes(symbol)) return true // Netswap/Agora LP Token
  if (chain === 'optimism' && /(-ZS)/.test(symbol)) return true
  if (chain === 'arbitrum' && /^(crAMM|vrAMM)-/.test(symbol)) return true // ramses LP
  if (chain === 'arbitrum' && /^(DLP|LP-)/.test(symbol)) return false // DODO or Wombat
  if (chain === 'base' && /^(v|s)-/.test(symbol)) return true // Equalizer LP
  if (chain === 'bsc' && /(-APE-LP-S)/.test(symbol)) return false
  if (chain === 'scroll' && /(cSLP|sSLP)$/.test(symbol)) return true //syncswap LP
  if (chain === 'btn' && /(XLT)$/.test(symbol)) return true //xenwave LP
  if (['fantom', 'nova',].includes(chain) && ['NLT'].includes(symbol)) return true
  if (chain === 'ethereumclassic' && symbol === 'ETCMC-V2') return true
  let label

  if (symbol.startsWith('ZLK-LP') || symbol.includes('DMM-LP') || (chain === 'avax' && 'DLP' === symbol) || symbol === 'fChe-LP')
    label = 'Blackisting this LP because of unsupported abi'

  if (label) {
    sdk.log(label, token, symbol)
    return false
  }

  const isLPRes = LP_SYMBOLS.includes(symbol) || /(UNI-V2|vAMM|sAMM)/.test(symbol) || symbol.split(/\W+/).includes('LP')

  // if (isLPRes && !['UNI-V2', 'Cake-LP'].includes(symbol))
  //   sdk.log(chain, symbol, token)

  return isLPRes
}

function mergeExports(...exportsArray) {
  exportsArray = exportsArray.flat()
  const exports = {}

  exportsArray.forEach(exportObj => {
    Object.keys(exportObj).forEach(key => {
      if (typeof exportObj[key] !== 'object') {
        exports[key] = exportObj[key]
        return;
      }
      Object.keys(exportObj[key]).forEach(key1 => addToExports(key, key1, exportObj[key][key1]))
    })
  })

  Object.keys(exports)
    .filter(chain => typeof exports[chain] === 'object')
    .forEach(chain => {
      const obj = exports[chain]
      Object.keys(obj).forEach(key => {
        if (obj[key].length > 1)
          obj[key] = sdk.util.sumChainTvls(obj[key])
        else
          obj[key] = obj[key][0]
      })
    })


  return exports

  function addToExports(chain, key, fn) {
    if (!exports[chain]) exports[chain] = {}
    if (!exports[chain][key]) exports[chain][key] = []
    exports[chain][key].push(fn)
  }
}

async function getBalance(chain, account) {
  switch (chain) {
    case 'bitcoin':
      return (await http.get(`https://chain.api.btc.com/v3/address/${account}`)).data.balance / 1e8
    case 'bep2':
      const balObject = (await http.get(`https://api-binance-mainnet.cosmostation.io/v1/account/${account}`)).balances.find(i => i.symbol === 'BNB')
      return +(balObject || { free: 0 }).free
    default: throw new Error('Unsupported chain')
  }
}

function getUniqueAddresses(addresses, isCaseSensitive = false) {
  const set = new Set()
  addresses.forEach(i => set.add(isCaseSensitive ? i : i.toLowerCase()))
  return [...set]
}

const DEBUG_MODE = () => getEnv('LLAMA_DEBUG_MODE')
const log = sdk.log

function sliceIntoChunks(arr, chunkSize = 100) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


function stripTokenHeader(token) {
  token = token.toLowerCase();
  return token.indexOf(":") > -1 ? token.split(":")[1] : token;
}

async function diplayUnknownTable({ tvlResults = {}, tvlBalances = {}, storedKey = 'ethereum', tableLabel = 'Unrecognized tokens' }) {
  if (!DEBUG_MODE()) return;
  const balances = {}
  storedKey = storedKey.split('-')[0]
  Object.entries(tvlResults.tokenBalances).forEach(([label, balance]) => {
    if (!label.startsWith('UNKNOWN')) return;
    const token = label?.split('(')[1]?.replace(')', '')
    balances[token] = tvlBalances[token]
    if (balances[token] === '0') delete balances[token]
  })

  try {
    await debugBalances({ balances, chain: storedKey, log, tableLabel, withETH: false, })
  } catch (e) {
    // sdk.log(e)
    log('failed to fetch prices for', balances)
  }
}

const nullAddress = ADDRESSES.null
async function getSymbols(chain, tokens) {
  tokens = tokens.filter(i => i.includes('0x')).map(i => i.slice(i.indexOf('0x'))).filter(i => i !== nullAddress)
  const calls = tokens.map(i => ({ target: i }))
  const { output: symbols } = await sdk.api.abi.multiCall({
    abi: 'erc20:symbol',
    calls,
    chain,
  })

  const response = {}
  symbols.map(i => response[i.input.target] = i.output)
  return response
}

async function getDecimals(chain, tokens) {
  tokens = tokens.filter(i => i.includes('0x')).map(i => i.slice(i.indexOf('0x')))
  const calls = tokens.map(i => ({ target: i }))
  const { output: symbols } = await sdk.api.abi.multiCall({
    abi: 'erc20:decimals',
    calls,
    chain,
  })

  const response = {}
  symbols.map(i => response[i.input.target] = i.output)
  return response
}

async function debugBalances({ balances = {}, chain, log = false, tableLabel = '', withETH = true }) {
  if (!DEBUG_MODE() && !log) return;
  if (!Object.keys(balances).length) return;

  const labelMapping = {}
  const tokens = []
  const ethTokens = []
  Object.keys(balances).forEach(label => {
    let token = stripTokenHeader(label)
    if (chain === 'tron') {
      token = label.slice(5)
      tokens.push(token)
      labelMapping[label] = token
      return
    }
    if (!token.startsWith('0x') || chain === 'starknet') return;
    if (!label.startsWith(chain))
      ethTokens.push(token)
    else
      tokens.push(token)
    labelMapping[label] = token
  })

  if (tokens.length > 400) {
    sdk.log('too many unknowns')
    return;
  }

  const api = new sdk.ChainApi({ chain })

  const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: tokens, permitFailure: true, })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens, permitFailure: true, })
  let name = await api.multiCall({ abi: erc20.name, calls: tokens, permitFailure: true, })
  name = name.map(i => i && i.length > 50 ? i.slice(0, 50) + '...' : i)

  let symbolsETH, nameETH

  if (withETH) {
    const ethApi = new sdk.ChainApi()
    symbolsETH = await ethApi.multiCall({ abi: 'erc20:symbol', calls: ethTokens, permitFailure: true, })
    nameETH = await ethApi.multiCall({ abi: erc20.name, calls: ethTokens, permitFailure: true, })
  }

  let symbolMapping = symbols.reduce((a, i, y) => ({ ...a, [tokens[y]]: i }), {})
  let decimalsMapping = decimals.reduce((a, i, y) => ({ ...a, [tokens[y]]: i }), {})
  let nameMapping = name.reduce((a, i, y) => ({ ...a, [tokens[y]]: i }), {})
  if (withETH) {
    symbolMapping = symbolsETH.reduce((a, i, y) => ({ ...a, [ethTokens[y]]: i }), symbolMapping)
    nameMapping = nameETH.reduce((a, i, y) => ({ ...a, [ethTokens[y]]: i }), nameMapping)
  }
  const logObj = []
  Object.entries(balances).forEach(([label, balance]) => {
    let token = labelMapping[label]
    let name = token && nameMapping[token] || '-'
    let symbol = token && symbolMapping[token] || '-'
    let decimal = token && decimalsMapping[token]
    if (decimal)
      balance = (balance / (10 ** decimal)).toFixed(0)

    logObj.push({ name, symbol, balance, label, decimals: decimal })
  })

  sdk.log('Balance table for [%s] %s', chain, tableLabel)
  const filtered = logObj.filter(i => {
    const symbol = i.symbol?.toLowerCase() ?? ''
    if (/\.(com|net|org|xyz|site|io)/.test(symbol)) return false
    if (/claim|access|airdrop/.test(symbol)) return false
    return true
  })
  if (filtered.length)
    console.table(filtered)
}

function once(func) {
  let previousResponse
  let called = false
  function wrapped(...args) {
    if (called) return previousResponse
    called = true
    previousResponse = func(...args)
    return previousResponse
  }
  return wrapped
}

module.exports = {
  log,
  createIncrementArray,
  fetchURL,
  postURL,
  returnBalance,
  returnEthBalance,
  isLP,
  mergeExports,
  getBalance,
  getUniqueAddresses,
  sliceIntoChunks,
  sleep,
  debugBalances,
  stripTokenHeader,
  diplayUnknownTable,
  getSymbols,
  getDecimals,
  getParamCalls,
  once,
  isICHIVaultToken,
}
