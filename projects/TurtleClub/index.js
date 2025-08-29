const { sumTokensExport } = require("../helper/unwrapLPs");
const { tokens, vaultContracts } = require("./assets");

const plainTokens = Object.values(tokens).flatMap(chain => Object.values(chain));

module.exports = {
    // All vaults currently ethereum
    doublecounted: true,
    ethereum: {
        tvl: sumTokensExport({
            owners: vaultContracts,
            tokens: plainTokens,
            permitFailure: true,
            tokenConfig: { onlyWhitelisted: false },
        }),
    },
};