const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const WINK_TOKEN_CONTRACT = '0x8c3441E7B9aA8A30a542DDE048dd067DE2802E9B';
const LOCK_WINK_CONTRACT = '0x49C4EeC1d4fFFcdFF415E0757F01Cc50eeF5d4FD';

const USDW_TOKEN_CONTRACT = '0xab670FDfb0060BDC6508B84a309ff41b56CCAf3f';
const LOCK_USDW_CONTRACT = '0x231fB0E6AD5d975151fC8d5b5C5EB164D265fE85';
const SAVINGS_USDW_CONTRACT = '0xfB379c1f5431E8065e987B36C9BDAF93cba18740';

const USDW_RESERVE = '0x7dA313eEeE31526022D2E92B0e3a6A0838Df2587';
const LP_RESERVE = '0x297df0036835b6bff81980b4d86c3aeecbacf543';
const LP_MANAGER = '0xb1502cbeffd253e3e695b8910e779cde2e2079ab';

module.exports = {
  methodology: 'Tokens backing USDW is counted as tvl, and locked WINK and USDW tokens are counted as staking.',
  hallmarks: [
    [1736001563, "WINK Finance Launch"],
  ],
  polygon: {
    tvl: sumTokensExport({ owners: [USDW_RESERVE, LP_RESERVE, LP_MANAGER], resolveUniV3: true, blacklistedTokens: [USDW_TOKEN_CONTRACT], tokens: [ADDRESSES.polygon.USDT]}),
    staking: sumTokensExport({ owners: [LOCK_WINK_CONTRACT, LOCK_USDW_CONTRACT, SAVINGS_USDW_CONTRACT], tokens: [WINK_TOKEN_CONTRACT, USDW_TOKEN_CONTRACT]}),
  }
}; 
