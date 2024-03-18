const { sumTokensExport } = require("../helper/unwrapLPs");

const v2Deposits = "0xC3EcaDB7a5faB07c72af6BcFbD588b7818c4a40e";
const v3Deposits = "0xc28EffdfEF75448243c1d9bA972b97e32dF60d06";

// https://docs.hyperlock.finance/developers/hyperlock-contracts
module.exports = {
  doublecounted: true,
  blast: {
    tvl: sumTokensExport({ owners: [v2Deposits, v3Deposits], tokens: ["0x12c69bfa3fb3cba75a1defa6e976b87e233fc7df"], resolveUniV3: true, resolveLP: true }),
  },
};
