const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require("../helper/coreAssets.json");

const JBTC_ADDRESS = 'EQCbkRdpnrWZfm07dP5n_wjGx6llNkHNIdmZ-gpIQcDP-J-5'

module.exports = {
  methodology: 'Total amount of BTC locked in smart contract EQCbkRdpnrWZfm07dP5n_wjGx6llNkHNIdmZ-gpIQcDP-J-5.',
  start: '2024.12.05',
  ton: {
    tvl: sumTokensExport({ owner: JBTC_ADDRESS, tokens: [ADDRESSES.null]}),
  }
}
