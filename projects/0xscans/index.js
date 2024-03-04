const { sumTokensExport } = require('../helper/unknownTokens')

const zeroxscans = "0x10703cA5e253306e2ABABD68e963198be8887c81"
const stakingPool = "0x67a37e939A46eFFd65A91949eC7c8587BD82aAa7"

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: sumTokensExport({ owners: [stakingPool], tokens: [zeroxscans] }),
  },
  methodology:
    "Counts all 0xScans tokens in the staking pools",
};
