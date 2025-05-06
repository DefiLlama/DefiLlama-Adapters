const { sumTokensExport } = require("../helper/unwrapLPs");
const { tokens: tokensObj, vaultContracts: owners } = require("./assets");

const tokens = Object.values(tokensObj).map(chain => Object.values(chain)).flat();

module.exports = {
    // All vaults currently ethereum
    doublecounted: true,
    ethereum: {
        tvl: sumTokensExport({ owners, tokens, permitFailure: true, onlyWhitelisted: false }),
    },
};