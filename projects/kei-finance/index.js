const { staking } = require('../helper/staking')
const TOKEN_ADDRESS = "0xF75C7a59bCD9bd207C4Ab1BEB0b32EEd3B6392f3";
const STAKING_CONTRACT = "...";

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking: staking(STAKING_CONTRACT, TOKEN_ADDRESS)
  }
};
