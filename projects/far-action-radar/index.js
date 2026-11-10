// FAR Action Radar (Base): https://www.faractionradar.com
//
// - staking: FARO that users lock in FaroLocker to unlock Pro (their own tokens, withdrawable at lock end).
// - pool2:   the FARO/WETH Uniswap v3 launch position held by FaroLpLock (locked until 2028-11-04).
// - tvl:     none. Reward pools (Fortune Mining) are pre-funded by the project and are not user deposits.
const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const FARO = "0x98233f8449A07c98157CB68cf394a052a99a67F0";
const FARO_LOCKER = "0xAfD7189fd506D018cE45Bd4898E70ceE62E8E8a4";
const FARO_LP_LOCK = "0x8EA12076963305d8f6A1c9Ee58FeDC54a3fA1785";

module.exports = {
  methodology:
    "Staking counts FARO locked by users in FaroLocker to unlock FAR Pro. Pool2 counts the FARO/WETH Uniswap v3 position locked in FaroLpLock. Project-funded reward pools are not counted.",
  start: 1793894749, // 2026-11-05 16:05:49 UTC, FARO launch
  base: {
    tvl: () => ({}),
    staking: staking(FARO_LOCKER, FARO),
    pool2: async (api) => sumTokens2({ api, owners: [FARO_LP_LOCK], resolveUniV3: true }),
  },
};
