const sdk = require("@defillama/sdk");
const { getUniTVL } = require("../helper/unknownTokens");
// const pUSDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
// const pBORA = "0x0EF39E52704Ad52E2882BBfA6781167E1b6c4510"
// const pair = "0x14be05a3d26991f07288F4a0C85a8d54AFa36a80"

module.exports = {
    timetravel: false,
    polygon: {
        tvl: getUniTVL({factory: '0x9c9238b2E47D61482D36deaFcDCD448D8bAAd75b', coreAssets: ['usdc', 'pBORA']}),
    }
}