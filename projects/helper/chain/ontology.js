// Ontology explorer access lives in @defillama/sdk (`sdk.chains.ontology`, `ONTOLOGY_EXPLORER` overrides the url);
// this file keeps the TVL helper (native ONT / ONG sumTokens).
const sdk = require('@defillama/sdk')
const { sleep } = require('../utils')

const ontology = sdk.chains.ontology

// native ONT / ONG balances (already in whole coins)
const ASSETS = { ont: 'ontology', ong: 'ong' }

async function getNativeBalances(address) {
  return ontology.getNativeBalances({ address })
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
