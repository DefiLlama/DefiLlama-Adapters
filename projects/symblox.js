const { sumTokens2 } = require("./helper/unwrapLPs");

const symblox = "0xD0CB9244844F3E11061fb3Ea136Aab3a6ACAC017";
const pools = {
  "0x2af1fea48018fe9f1266d67d45b388935df1c14d": "0xaadbaa6758fc00dec9b43a0364a372605d8f1883",
  "0x720b92ef8ee928c5cbe9ca787321802610bcbf6e": "0x2b1abeb48f875465bf0d3a262a2080ab1c7a3e39",
  "0x974d24a6bce9e0a0a27228e627c9ca1437fe0286": "0x380f73bad5e7396b260f737291ae5a8100baabcd",
  "0xe7557efbe705e425de6a57e90447ba5ad70e9de5": "0x4b773e1ae1baa4894e51cc1d1faf485c91b1012f",
};

async function tvl(api) {
  const ownerTokens = Object.entries(pools).map(([id, pool]) => [[pool, symblox], id])
  return sumTokens2({api, ownerTokens })
}

module.exports = {
  velas: {
    tvl,
  },
};
