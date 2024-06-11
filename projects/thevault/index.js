const { getStakedSol } = require("../helper/solana")

async function tvl(api) {
  // https://docs.thevault.finance/about/stake-pool-address
  await getStakedSol('GdNXJobf8fbTR5JSE7adxa6niaygjx4EEbnnRaDCHMMW', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};
