const { sumTokensExport } = require("./helper/unknownTokens");
const { staking } = require("./helper/staking");

module.exports = {
  misrepresentedTokens: true,
    bsc: {
    tvl: () => ({}),
    pool2: sumTokensExport({ owner: '0x5d350F07c1D9245c1Ecb7c622c67EDD49c6a0A35', tokens: ['0xB31Ecb43645EB273210838e710f2692CC6b30a11']}),
    staking: staking("0xC77CfF4cE3E4c3CB57420C1488874988463Fe4a4", "0x232fb065d9d24c34708eedbf03724f2e95abe768"),
  },
};
