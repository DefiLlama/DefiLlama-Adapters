const { get } = require('../http')
const { sleep } = require('../utils')

// native ONT / ONG balances (already in whole coins) from the Ontology explorer
const ASSETS = { ont: 'ontology', ong: 'ong' }

async function getNativeBalances(address) {
  const { result } = await get(`https://explorer.ont.io/v2/addresses/${address}/native/balances`)
  return result ?? []
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balances = await getNativeBalances(owner)
    for (const { asset_name, balance } of balances) {
      const geckoId = ASSETS[asset_name]
      if (!geckoId) continue
      api.addCGToken(geckoId, Number(balance))
    }
    await sleep(200)
  }
}

module.exports = {
  getNativeBalances,
  sumTokens,
}
