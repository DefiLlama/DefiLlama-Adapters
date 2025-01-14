const { sumTokensExport } = require('../helper/chain/ton');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Counts the pre-market wallet size as the TVL.',
  timetravel: false,
  ton: {
    tvl: sumTokensExport({ owner: 'UQAGNpAAIaDrvGWdUCB7ycc_S5tLO0S6PPK0UkrrQb27AWKM', tokens: [ADDRESSES.null]}),
  }
}