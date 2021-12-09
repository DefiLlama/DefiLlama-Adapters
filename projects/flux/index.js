// import { providers, Contract } from "ethers";
const axios = require("axios");
const url = "https://gateway.api.01defi.com/base/fluxTvl/get";

//total
async function fetch() {
  const data = await axios.get(url);
  return Number(data?.data?.data?.lendingTVL);
}

// tvl and staking amount
async function getChainData(chain) {
  const data = await axios.get(url);
  const info = (data?.data?.data?.detail || []).find(
    (item) => item.chain === chain
  );

  return {
    fetch: Number(info.lendingTVL),
    staking: Number(info.stakedTVL),
  };
}

module.exports = {
  timetravel: true,
  bsc: getChainData('bsc'),
  okexchain: getChainData('okexchain'),
  heco: getChainData('heco'),
  arbitrum: getChainData('arbitrum'),
  polygon: getChainData('polygon'),
  conflux: getChainData('conflux'),
  fetch,
  name: "Flux Project",
};
