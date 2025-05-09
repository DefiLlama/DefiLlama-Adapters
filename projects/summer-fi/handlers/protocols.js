const sdk = require("@defillama/sdk");
const { ADDRESSES } = require("../constants/addresses");
const { getAaveV3Data, getAjnaData, getMorphoBlueData } = require("../helpers/protocol-helpers");

async function aaveV3Tvl({ api, chain }) {
  const { pool, oracle, poolDataProvider } = ADDRESSES[chain].aaveV3;
  const data = await getAaveV3Data({ api, pool, oracle, poolDataProvider });
  
  for (const [token, amount] of Object.entries(data)) {
    api.add(token, amount);
  }
}

async function ajnaTvl({ api, chain }) {
  const { pool, quoteToken } = ADDRESSES[chain].ajna;
  const data = await getAjnaData({ api, pool, quoteToken });
  
  for (const [token, amount] of Object.entries(data)) {
    api.add(token, amount);
  }
}

async function morphoBlueTvl({ api, chain }) {
  const { market, urdFactory } = ADDRESSES[chain].morphoBlue;
  const data = await getMorphoBlueData({ api, market, urdFactory });
  
  for (const [token, amount] of Object.entries(data)) {
    api.add(token, amount);
  }
}

module.exports = {
  aaveV3Tvl,
  ajnaTvl,
  morphoBlueTvl,
}; 