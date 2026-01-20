const { staking } = require("../helper/staking");

const vlty = "0x38A5cbe2FB53d1d407Dd5A22C4362daF48EB8526"
const stakingContract = "0x52168c7E798b577DB2753848f528Dc04db26c8ad"

module.exports = {
  deadFrom: '2025-01-01',
  misrepresentedTokens: true,
  methodology: 'TVL counts the tokens deposited to all vaults',
  bsc: {
    staking: staking(stakingContract, vlty),
    tvl: () => ({}),
  }
};