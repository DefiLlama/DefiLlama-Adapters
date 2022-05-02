const { sumTokensUnknown, getSolBalance } = require("../helper/solana")
const BigNumber = require("bignumber.js")
const tokens = require('./tokens.json')

const contractAddress = '8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ'
const tokensAndAccounts = tokens.map((token) => [
  token.address,
  contractAddress,
  token.coingeckoId,
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
