const MFF = "0x78b65477bba78fc11735801d559c386611d07529";
const contract = "0xDE707357D10D86aE21373b290eAbBA07360896F6";
const { staking } = require('../helper/staking')

module.exports = {
  aurora: {
    tvl: () => ({}),
    staking: staking(contract, MFF),
  },
};
