const { getStakedSol } = require("../helper/solana")

async function tvl(api) {
  // https://stake-docs.solblaze.org/developers/addresses
  await getStakedSol('6WecYymEARvjG5ZyqkrVQ6YkhPfujNzWpSPwNKXHCbV2', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};
