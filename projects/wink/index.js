const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const WINK_TOKEN_CONTRACT = '0x8c3441E7B9aA8A30a542DDE048dd067DE2802E9B';
const LOCK_WINK_CONTRACT = '0x49C4EeC1d4fFFcdFF415E0757F01Cc50eeF5d4FD';

const USDW = '0xab670FDfb0060BDC6508B84a309ff41b56CCAf3f'

const USDW_RESERVE = '0x7dA313eEeE31526022D2E92B0e3a6A0838Df2587'
const LP_RESERVE = '0x297df0036835b6bff81980b4d86c3aeecbacf543'
const LP_MANAGER = '0xb1502cbeffd253e3e695b8910e779cde2e2079ab'

module.exports = {
  methodology: 'Tokens backing USDW is counted as tvl, and locked wink tokens are counted as staking.',
  hallmarks: [
    [1736001563, "WINK Finance Launch"],
  ],
  polygon: {
    tvl: sumTokensExport({ owners: [USDW_RESERVE, LP_RESERVE, LP_MANAGER], resolveUniV3: true, blacklistedTokens: [USDW], tokens: [ADDRESSES.polygon.USDT]}),
    staking: sumTokensExport({ owners: [LOCK_WINK_CONTRACT], tokens: [WINK_TOKEN_CONTRACT]}),
  }
}; 
