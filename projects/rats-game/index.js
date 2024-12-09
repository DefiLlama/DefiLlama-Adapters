const { sumTokensExport } = require('../helper/chain/ton');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Counts the donation wallet size as the TVL.',
  timetravel: false,
  ton: {
    tvl: sumTokensExport({ owner: 'UQCwN6wUedlW5GJX6ATYNcBaUhpYt5eCWBRA6kK6mfMtIl90', tokens: [ADDRESSES.null]}),
  }
}