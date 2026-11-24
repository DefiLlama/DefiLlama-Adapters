const sdk = require('@defillama/sdk')
const { getCache, setCache } = require('../cache')
const { sliceIntoChunks } = require('../utils')
const { nullAddress } = require('../tokenMapping')
const uniV3ABI = require('../abis/uniV3.json')

const WEEK = 7 * 24 * 3600

/**
 * For adapters that read many accounts (wallets, vaults, markets, ...) of which most hold next to nothing.
 * An account worth less than `thresholdUSD` is stored with the balances it held, and for the next week those
 * stored balances are counted instead of reading the account again. Nothing is dropped from TVL: a low-value
 * account is only up to a week stale.
 *
 *   const lowValue = await getLowValueCache({ api, project: 'my-project' })
 *   const ids = lowValue.filter(allIds)             // counts the stored balances of fresh low-value ids, returns the rest
 *   ...read balances of `ids`...
 *   await lowValue.record([[id, { [token]: amount }], ...])   // counts them, and stores the low-value ones
 *   await lowValue.save()
 *
 * - record() saves every `checkpointEvery` ids, so a run that is killed half way does not lose what it read.
 * - An account holding a token with no price is never treated as low value.
 * - The first time an account is stored it gets a random age, so the weekly re-reads spread across runs.
 * - A run at a past timestamp reads every account and stores nothing: "low value" is only known for now.
 */
async function getLowValueCache({ api, project, key, thresholdUSD = 100, recheckSeconds = WEEK, checkpointEvery = 2000 }) {
  const now = Math.floor(Date.now() / 1000)
  const isCurrentRun = !api.timestamp || api.timestamp > now - 3600
  const cacheKey = `low-value/${key ?? api.chain}`
  const { entries = {} } = isCurrentRun ? await getCache(project, cacheKey) : {}
  let unsaved = 0

  const priceKey = token => `${api.chain}:${/^0x/i.test(token) ? token.toLowerCase() : token}`
  const addBalances = balances => Object.entries(balances).forEach(([token, amount]) => api.add(token, amount))

  function filter(ids) {
    return ids.filter(id => {
      const entry = entries[id]
      if (!entry || now - entry[0] >= recheckSeconds) return true
      addBalances(entry[1])
      return false
    })
  }

  async function record(results) {
    results.forEach(([, balances]) => addBalances(balances))
    if (!isCurrentRun || !results.length) return

    const tokens = new Set()
    results.forEach(([, balances]) => Object.entries(balances).forEach(([token, amount]) => { if (+amount) tokens.add(token) }))
    const prices = await sdk.coins.getPrices([...tokens].map(priceKey), 'now')

    for (const [id, balances] of results) {
      const held = Object.fromEntries(Object.entries(balances).filter(([, amount]) => +amount).map(([token, amount]) => [token, String(amount)]))
      let usdValue = 0
      for (const [token, amount] of Object.entries(held)) {
        const price = prices[priceKey(token)]
        usdValue += price?.price === undefined ? Infinity : amount / 10 ** (price.decimals ?? 0) * price.price
      }
      if (usdValue < thresholdUSD) entries[id] = [entries[id] ? now : now - Math.floor(Math.random() * recheckSeconds), held]
      else delete entries[id]
    }

    unsaved += results.length
    if (unsaved >= checkpointEvery) await save()
  }

  async function save() {
    if (!isCurrentRun || !unsaved) return
    await setCache(project, cacheKey, { entries })
    unsaved = 0
  }

  return { filter, record, save }
}

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'

/**
 * api.sumTokens for a very large list of owners (one account per user), with the low-value store above:
 * owners worth less than `thresholdUSD` are counted from the store and read again once a week.
 *
 *   await sumTokensLowValue({ api, project: 'my-project', owners, tokens })
 *
 * - `tokens`: erc20s, plus the null address for the gas token (read with Multicall3 getEthBalance).
 * - `transform(balances, owner)`: optional, returns the balances to count for an owner (eg. a share token turned into
 *    its underlying). It gets and returns `{ [token]: amount }`, token addresses in lower case.
 * - `freshCount`: for a list that is oldest first (built from event logs), the newest owners are read on every run
 *    whatever they hold, because a new account starts empty and is funded afterwards.
 * - An owner with a failed read is counted with what was read and is not stored, so it is read again next run.
 * - `key` separates several owner lists of one project on the same chain.
 */
async function sumTokensLowValue({ api, project, key, owners, tokens, transform, freshCount = 0, groupSize = 2000, thresholdUSD, recheckSeconds }) {
  const lowValue = await getLowValueCache({ api, project, key, thresholdUSD, recheckSeconds, checkpointEvery: groupSize })
  tokens = [...new Set(tokens.map(token => token.toLowerCase()))]
  const erc20s = tokens.filter(token => token !== nullAddress)
  const hasNative = erc20s.length !== tokens.length
  owners = [...new Set(owners.map(owner => owner.toLowerCase()))]
  const firstFresh = Math.max(0, owners.length - freshCount)
  const pending = lowValue.filter(owners.slice(0, firstFresh)).concat(owners.slice(firstFresh))

  for (const group of sliceIntoChunks(pending, groupSize)) {
    const held = group.map(() => ({}))
    const failed = new Set()

    if (erc20s.length) {
      const calls = group.flatMap(owner => erc20s.map(token => ({ target: token, params: owner })))
      const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true })
      balances.forEach((balance, i) => {
        const ownerIndex = Math.floor(i / erc20s.length)
        if (balance == null) failed.add(ownerIndex)
        else held[ownerIndex][erc20s[i % erc20s.length]] = balance
      })
    }
    if (hasNative) {
      const balances = await api.multiCall({ abi: 'function getEthBalance(address) view returns (uint256)', target: MULTICALL3, calls: group, permitFailure: true })
      balances.forEach((balance, i) => {
        if (balance == null) failed.add(i)
        else held[i][nullAddress] = balance
      })
    }

    const results = []
    group.forEach((owner, i) => {
      const balances = transform ? transform(held[i], owner) : held[i]
      if (failed.has(i)) Object.entries(balances).forEach(([token, amount]) => api.add(token, amount))
      else results.push([owner, balances])
    })
    await lowValue.record(results)
  }
  await lowValue.save()
}

const range = (from, to) => Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i)

// Position ids of an owner that never lets a position go (a locker). ERC721Enumerable keeps the order of such an
// owner's list, so only the indexes past the stored length are read.
async function getLockedPositionIds({ api, project, key, nftAddress, owner }) {
  const now = Math.floor(Date.now() / 1000)
  const isCurrentRun = !api.timestamp || api.timestamp > now - 3600
  const cacheKey = `position-ids/${key ?? api.chain}`
  const count = +(await api.call({ target: nftAddress, abi: 'erc20:balanceOf', params: owner }))
  let { ids = [] } = isCurrentRun ? await getCache(project, cacheKey) : {}
  if (ids.length > count) ids = [] // a position left the owner after all: the indexes moved, read them all again
  if (ids.length === count) return ids

  const more = await api.multiCall({ target: nftAddress, abi: uniV3ABI.tokenOfOwnerByIndex, calls: range(ids.length, count).map(i => ({ params: [owner, i] })), permitFailure: true })
  const complete = more.every(id => id != null)
  ids = ids.concat(more.filter(id => id != null).map(String))
  // a list with a failed read in it is used for this run only
  if (isCurrentRun && complete) await setCache(project, cacheKey, { ids })
  return ids
}

/**
 * Uniswap V3 NFT positions with the low-value store above, for launchpads and lockers holding tens of thousands of
 * positions of which most are worth next to nothing. A position worth less than `thresholdUSD` is stored with its
 * balances, counted from the store, and read again once a week.
 *
 *   await sumUniV3PositionsLowValue({ api, project: 'my-project', nftAddress, lockedOwner: locker, whitelistedTokens })
 *
 * - `positionIds`, oldest first, or `lockedOwner`: an owner that never lets a position go, whose id list is stored and
 *    only extended (see getLockedPositionIds).
 * - `whitelistedTokens`: only these sides of a position are counted (and decide whether it is low value).
 * - `freshCount`: the newest positions are read on every run whatever they are worth, because a new launch starts
 *    with nothing on its quote side and gains it as it trades.
 * - A position with a failed read is left out of this run only and read again next run.
 */
async function sumUniV3PositionsLowValue({ api, project, key, nftAddress, positionIds, lockedOwner, whitelistedTokens = [], freshCount = 2000, groupSize = 5000, thresholdUSD, recheckSeconds }) {
  const { addUniV3LikePosition } = require('../unwrapLPs')
  if (!positionIds) positionIds = await getLockedPositionIds({ api, project, key, nftAddress, owner: lockedOwner })
  positionIds = positionIds.map(String)
  const whitelist = new Set(whitelistedTokens.map(token => token.toLowerCase()))
  const factory = await api.call({ target: nftAddress, abi: uniV3ABI.factory })

  const lowValue = await getLowValueCache({ api, project, key, thresholdUSD, recheckSeconds, checkpointEvery: groupSize })
  const firstFresh = Math.max(0, positionIds.length - freshCount)
  const pending = lowValue.filter(positionIds.slice(0, firstFresh)).concat(positionIds.slice(firstFresh))

  for (const group of sliceIntoChunks(pending, groupSize)) {
    const positions = await api.multiCall({ target: nftAddress, abi: uniV3ABI.positions, calls: group, permitFailure: true })
    const poolKey = position => `${position.token0}-${position.token1}-${position.fee}`.toLowerCase()
    const byPool = {}
    positions.forEach(position => { if (position) byPool[poolKey(position)] = position })
    const keys = Object.keys(byPool)
    const pools = await api.multiCall({ target: factory, abi: uniV3ABI.getPool, calls: keys.map(k => ({ params: [byPool[k].token0, byPool[k].token1, byPool[k].fee] })), permitFailure: true })
    const liveKeys = keys.filter((_, i) => pools[i] && pools[i] !== nullAddress)
    const slot0s = await api.multiCall({ abi: uniV3ABI.slot0, calls: liveKeys.map(k => pools[keys.indexOf(k)]), permitFailure: true })
    const tickOf = {}
    liveKeys.forEach((k, i) => { if (slot0s[i]) tickOf[k] = +slot0s[i].tick })

    const results = []
    group.forEach((id, i) => {
      const position = positions[i]
      if (!position || tickOf[poolKey(position)] === undefined) return
      const held = {}
      const add = (token, amount) => {
        token = token.toLowerCase()
        if (whitelist.size && !whitelist.has(token)) return
        if (amount >= 1) held[token] = BigInt(Math.floor(amount)).toString()
      }
      addUniV3LikePosition({ api: { add }, token0: position.token0, token1: position.token1, liquidity: position.liquidity, tickLower: +position.tickLower, tickUpper: +position.tickUpper, tick: tickOf[poolKey(position)] })
      results.push([id, held])
    })
    await lowValue.record(results)
  }
  await lowValue.save()
}

module.exports = { getLowValueCache, sumTokensLowValue, sumUniV3PositionsLowValue }
