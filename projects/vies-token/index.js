const { sumTokensExport } = require("../helper/unwrapLPs");

const VIES_TOKEN_CONTRACT = "0xB1D4e07659c91872dB927939f0BC6CD0747764BC";

const STAKING_CONTRACT = "0xEDE0c6549AC5929bf54E893cD125B1d4553D86bb";
const VAULT_CONTRACT = "0xae31BBB53d73EAED2D0412335F723052aA7390BA";

module.exports = {
  start: 1751302800,
  cronos: {
    tvl: () => ({}),
    staking: sumTokensExport({
      owners: [STAKING_CONTRACT, VAULT_CONTRACT,],
      token: VIES_TOKEN_CONTRACT,
    }),
  }
};