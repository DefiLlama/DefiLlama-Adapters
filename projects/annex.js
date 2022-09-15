const axios = require("axios");

async function bsc() {
  const lending = await axios.get("https://api.annex.finance/api/v1/governance/annex");
  return Number(lending.data.data.totalLiquidity);
}
// https://api.annex.finance/api/v1/pools
async function cronos() {
  const lending = await axios.get("https://cronosapi.annex.finance/api/v1/governance/annex");
  return Number(lending.data.data.totalLiquidity);
}

async function kava() {
  const lending = await axios.get("https://kavaapi.annex.finance/api/v1/governance/annex");
  return Number(lending.data.data.totalLiquidity);
}

module.exports = {
  methodology:
    'TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL. Data is pull from the Annex API "https://api.annex.finance/api/v1/governance/annex".',
  bsc: {
    fetch: bsc,
  },
  cronos: {
    fetch: cronos,
  },
  kava: {
    fetch: kava,
  },
  fetch: async () => (await bsc()) + (await cronos()) + (await kava()),
};
