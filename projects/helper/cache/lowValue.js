const sdk = require('@defillama/sdk')
const { getCache, setCache } = require('../cache')

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

module.exports = { getLowValueCache }
