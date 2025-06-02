const { sumTokensExport } = require('../helper/chain/ton');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Counts the pool size as the TVL.',
  timetravel: false,
  ton: {
    tvl: sumTokensExport({ owner: 'EQAgpXksmpJdcItdKvn97G0zD844iztZuKJa_3JnRr0XkCdD', tokens: [ADDRESSES.null]}),
  }
}
