const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const WINK_TOKEN_CONTRACT = '0x8c3441E7B9aA8A30a542DDE048dd067DE2802E9B';
const LOCK_WINK_CONTRACT = '0x49C4EeC1d4fFFcdFF415E0757F01Cc50eeF5d4FD';

const USDW_RESERVE = '0x7dA313eEeE31526022D2E92B0e3a6A0838Df2587'

module.exports = {
  methodology: 'Tokens backing USDW is counted as tvl, and locked wink tokens are counted as staking.',
  hallmarks: [
    [1736001563, "WINK Finance Launch"],
  ],
  polygon: {
    tvl: sumTokensExport({ owners: [USDW_RESERVE], tokens: [ADDRESSES.polygon.USDT]}),
    staking: sumTokensExport({ owners: [LOCK_WINK_CONTRACT], tokens: [WINK_TOKEN_CONTRACT]}),
  }
}; 
