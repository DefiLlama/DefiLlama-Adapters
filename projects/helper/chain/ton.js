// toncenter / tonapi transport and the address / BoC codec live in @defillama/sdk (`sdk.chains.ton`, which
// paces requests per service and sends TONCENTER_API_KEY / TON_API_KEY); this file keeps the TVL helpers.
const ADDRESSES = require('../coreAssets.json')
const plimit = require('p-limit')
const _rateLimited = plimit(9)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const { sumTokens2 } = require('../unwrapLPs')
const { getUniqueAddresses, sleep, sliceIntoChunks } = require('../utils')
const { ton } = require('@defillama/sdk').chains

// TON balance in nanoton (string)
async function getTonBalance(addr) {
  return ton.getTonBalance({ address: addr })
}

// { [rawJettonAddress]: { balance, price, decimals } }
async function getJettonBalances(addr) {
  const balances = await ton.getJettonBalances({ address: addr })
  return ton.jettonBalancesByAddress(balances, 'USD')
}

async function _sumTokensAccount({ api, addr, tokens = [], onlyWhitelistedTokens = false, useTonApiForPrices = true, }) {
  if (onlyWhitelistedTokens && tokens.length === 1 && tokens.includes(ADDRESSES.ton.TON)) return;
  const balances = await ton.getJettonBalances({ address: addr })
  await sleep(1000 * (3 * Math.random() + 3))
  tokens = tokens.map((a) => {
    if (a === ADDRESSES.ton.TON) return ADDRESSES.ton.TON
    return ton.normalizeAddress(a)
  })
  balances.forEach(({ balance, price, jetton }) => {
    const address = ton.normalizeAddress(jetton.address)
    if (onlyWhitelistedTokens && !tokens.includes(address)) return;
    if (!useTonApiForPrices) {
      api.add(address, balance)
      return;
    }
    const decimals = jetton.decimals
    price = price?.prices?.USD
    if (!decimals || !price) {
      api.add(address, balance)
      return;
    }
    const bal = balance * price / 10 ** decimals
    api.add('tether', bal, { skipChain: true })
  })
}

async function getTokenRates({ tokens = [] }) {
  return ton.getTokenRates({ tokens, currency: 'usd' })
}

async function getJettonsInfo(tokens) {
  return ton.getJettonsInfo({ addresses: tokens })
}

const sumTokensAccount = rateLimited(_sumTokensAccount)

async function sumTokens({ api, tokens, owners = [], owner, onlyWhitelistedTokens = false, useTonApiForPrices = true }) {
  if (!api) throw new Error('api is required')

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners, api.chain)

  if (tokens.includes(ADDRESSES.null)) await addTonBalances({ api, addresses: owners })
  if (onlyWhitelistedTokens && tokens.length === 1 && tokens.includes(ADDRESSES.ton.TON)) return sumTokens2({ api, })

  for (const addr of owners) {
    await sleep(1000 * (3 * Math.random() + 7))
    await sumTokensAccount({ api, addr, tokens, onlyWhitelistedTokens, useTonApiForPrices })
  }
  return sumTokens2({ api, })
}

function sumTokensExport({ ...args }) {
  return (api) => sumTokens({ api, ...args })
}

// runGetMethod; `num` stack entries are parsed as hex numbers, everything else is left raw
async function call({ target, abi, params = [], rawStack = false, }) {
  const stack = await ton.call({ target, method: abi, params, rawStack: true })

  if (rawStack) return stack

  stack.forEach((i, idx) => {
    if (i[0] === 'num') {
      stack[idx] = parseInt(i[1], 16)
    }
  })

  return stack
}

async function addJettonBalances({ api, jettonAddress, addresses, chunkSize = 399, sleepMs = 3000, forceSleep = false }) {
  api.log('Fetching Jetton balances', { jettonAddress, addresses: addresses.length })
  const chunks = sliceIntoChunks(addresses, chunkSize)
  for (const chunk of chunks) {
    const jetton_wallets = await ton.getJettonWallets({ owner: chunk, jetton: jettonAddress })
    jetton_wallets.forEach(({ balance }) => {
      api.add(jettonAddress, balance)
    })
    if (addresses.length > 199 || forceSleep) {
      await sleep(sleepMs)
    }
  }
}

async function addTonBalances({ api, addresses }) {
  api.log('Fetching TON balances', { addresses: addresses.length })
  const chunks = sliceIntoChunks(addresses, 399)
  let i = 0
  for (const chunk of chunks) {
    api.log('Fetching TON balances', { chunk: i++, chunks: chunks.length })
    const { accounts } = await ton.toncenterGet({ path: 'accountStates', params: { address: chunk.join(','), include_boc: false } })
    accounts.forEach(({ balance }) => {
      api.add(ADDRESSES.null, balance)
    })
    if (addresses.length > 199) {
      await sleep(3000)
    }
  }
}

// friendly (bounceable, url-safe) address stored in a base64 BoC `cell` / `slice` stack entry
function processTVMSliceReadAddress(base64String) {
  return ton.readAddressFromSlice(base64String)
}

module.exports = {
  addTonBalances,
  addJettonBalances,
  getTonBalance,
  getTokenRates,
  sumTokens,
  sumTokensExport,
  call,
  getJettonBalances,
  getJettonsInfo,
  rateLimited,
  processTVMSliceReadAddress
}
