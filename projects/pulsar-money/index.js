const { sumTokensExport } = require("../helper/chain/elrond");
const { getCoreAssets } = require('../helper/tokenMapping')

// const API_URL = "https://pulsar-money-prod.herokuapp.com/metrics/tvl";

const vault = 'erd1qqqqqqqqqqqqqpgq39rqpn2xvm0ykl2ccaa4h5zk5c9r647wdteswmap9l'

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ owner: vault, whitelistedTokens: getCoreAssets('elrond')}),
    vesting: sumTokensExport({ owner: vault, blacklistedTokens: getCoreAssets('elrond')}),
  },
};