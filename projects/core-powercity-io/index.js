const { sumTokensExport } = require("../helper/unknownTokens.js");

const CORE_STAKER = "0xa42BadB71271e9A460ED93C501308ECaab770c37";
const WATT_TOKEN = "0xDfdc2836FD2E63Bba9f0eE07901aD465Bff4DE71";
const WATT_PLS_LP = "0x956f097E055Fa16Aad35c339E17ACcbF42782DE6";

module.exports = {
    start: 1702377175,
    methodology: "No external tokens/coins staked/locked. Only protocol token WATT and WATT-PLS-LP staked within protocol.",
    pulse: {
        tvl: async () => ({}),
        staking: sumTokensExport({ owner: CORE_STAKER, tokens: [WATT_TOKEN], lps: [WATT_PLS_LP], useDefaultCoreAssets: true, }),
        pool2: sumTokensExport({ owner: CORE_STAKER, tokens: [WATT_PLS_LP], useDefaultCoreAssets: true, }),
    }
}