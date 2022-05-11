const { sumTokensUnknown, } = require("../helper/solana")
const tokens = require("./tokens")

const contractAddress = 'AfhhYsLMXXyDxQ1B7tNqLTXXDHYtDxCzPcnXWXzHAvDb'
const tokensAndAccounts = Object.values(tokens).map((token) => [
  token,
  contractAddress,
  'tether',
]);

async function tvl() {
  return sumTokensUnknown(tokensAndAccounts);
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};