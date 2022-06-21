const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const sdk = require('@defillama/sdk')
const http = require('./http')

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

async function getPrices(object) {
  var stringFetch = '';
  for (var key in object[0]) {
    if (object[0][key] != 'stable') {
      if (stringFetch.length > 0) {
        stringFetch = stringFetch + ',' + object[0][key];
      } else {
        stringFetch = object[0][key];
      }
    }
  }
  return fetchURL(`https://api.coingecko.com/api/v3/simple/price?ids=${stringFetch}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`)
}

async function getPricesFromContract(object) {
  var contractFetch = ''
  for (var key in object) {
    if (object[key]) {
      if (contractFetch.length > 0) {
        contractFetch = contractFetch + ',' + object[key];
      } else {
        contractFetch = object[key];
      }
    }
  }
  return fetchURL(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractFetch}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`)
}

async function getPricesfromString(stringFeed) {
  return fetchURL(`https://api.coingecko.com/api/v3/simple/price?ids=${stringFeed}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`)
}


async function fetchURL(url) {
  return retry(async bail => await axios.get(url), {
    retries: 3
  })
}

async function postURL(url, data) {
  return retry(async bail => await axios.post(url, data), {
    retries: 3
  })
}

function createIncrementArray(length) {
  const arr = []
  for (let i = 0; i < length; i++)
    arr.push(i)

  return arr
}

const LP_SYMBOLS = ['SLP', 'spLP', 'JLP', 'OLP', 'SCLP', 'DLP', 'MLP', 'MSLP', 'ULP', 'TLP', 'HMDX', 'YLP', 'SCNRLP', 'PGL', 'GREEN-V2', 'PNDA-V2', 'vTAROT', 'TETHYSLP', 'BAO-V2', 'DINO-V2', 'DFYNLP', 'LavaSwap', 'RLP']
const blacklisted_LPS = [
  '0xb3dc4accfe37bd8b3c2744e9e687d252c9661bc7',
  '0xf146190e4d3a2b9abe8e16636118805c628b94fe',
].map(i => i.toLowerCase())

function isLP(symbol, token, chain) {
  if (token && blacklisted_LPS.includes(token.toLowerCase())) return false
  if (chain === 'bsc' && ['OLP', 'DLP', 'MLP', 'LP'].includes(symbol)) return false
  if (chain === 'metis' && ['NLP'].includes(symbol)) return true // Netswap LP Token
  if (!symbol) return false
  let label

  if (symbol.startsWith('ZLK-LP') || symbol.includes('DMM-LP') || (chain === 'avax' && 'DLP' === symbol))
    label = 'Blackisting this LP because of unsupported abi'

  if (label) {
    if (DEBUG_MODE) console.log(label, token, symbol)
    return false
  }

  return LP_SYMBOLS.includes(symbol) || /(UNI-V2)/.test(symbol) || symbol.split(/\W+/).includes('LP')
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
    default: throw new Error('Unsupported chain')
  }
}

function getUniqueAddresses(addresses) {
  const set = new Set()
  addresses.forEach(i => set.add(i.toLowerCase()))
  return [...set]
}

const DEBUG_MODE = !!process.env.LLAMA_DEBUG_MODE

function log(...args) {
  if (DEBUG_MODE) {
    console.log(...args);
  }
}

function sliceIntoChunks(arr, chunkSize = 100) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

module.exports = {
  DEBUG_MODE,
  log,
  createIncrementArray,
  fetchURL,
  postURL,
  getPricesfromString,
  getPrices,
  returnBalance,
  returnEthBalance,
  getPricesFromContract,
  isLP,
  mergeExports,
  getBalance,
  getUniqueAddresses,
  sliceIntoChunks,
}
