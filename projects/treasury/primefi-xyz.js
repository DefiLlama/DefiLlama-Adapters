

const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const treasury = '0xF2e2A49631927108086268c68C559c63c3C8f73d'

module.exports = treasuryExports({
  ethereum: { owners: [treasury] },
  base: { owners: [treasury], ownTokens: ['0x7BBCf1B600565AE023a1806ef637Af4739dE3255'] },
  hyperliquid: { owners: [treasury], ownTokens: ['0x7BBCf1B600565AE023a1806ef637Af4739dE3255']},
  xdc: { owners: [treasury], tokens: [ADDRESSES.null, ADDRESSES.xdc.WXDC], ownTokens: ['0x81B244d0be055EF3BEF1b09B7826Cc2b108B2cBD'] },
})
