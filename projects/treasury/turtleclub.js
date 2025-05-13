const { tokens, treasuryMultisigs } = require('../TurtleClub/assets');
const { treasuryExports } = require("../helper/treasury");
function formatForTreasuryExport(tokens = {}) {
    const treasuryExportsFormat = {};
    for (const [chain, tokenList] of Object.entries(tokens)) {
        treasuryExportsFormat[chain] = { owners: treasuryMultisigs, tokens: Object.values(tokenList)};
    }
    return treasuryExportsFormat;
}

module.exports = treasuryExports(formatForTreasuryExport(tokens));
