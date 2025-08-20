const { sumTokensExport } = require("../helper/unwrapLPs");
const { tokens, vaultContracts } = require("./assets");

const plainTokens = Object.values(tokens).map(chain => Object.values(chain)).flat(1);

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