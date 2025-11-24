const { getUniTVL } = require("../helper/unknownTokens");

const tvl = getUniTVL({ factory: '0xCc8e4C2998395E56D06D985ba791138Edf48a8d4', useDefaultCoreAssets: true })

module.exports = {
    misrepresentedTokens: true,
    start: '2025-11-22',
    ethereum: { tvl },
};