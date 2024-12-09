const { sumTokensExport } = require('../helper/chain/ton');
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  methodology: 'Treasury (donations) amount',
  timetravel: false,
  ton: {
    tvl: sumTokensExport({ owner: 'UQCwN6wUedlW5GJX6ATYNcBaUhpYt5eCWBRA6kK6mfMtIl90', tokens: [ADDRESSES.null]}),
  }
}