// import { providers, Contract } from "ethers";

const axios = require("axios");
const url = "https://gateway.api.01defi.com/base/tvl/get";

// bsc
async function bsc() {
  const data = await axios.get(url);
  const info = (data?.data || []).find((item) => item.currency === "bsc");
  return Number(info.tvl);
}
// heco
async function heco() {
  const data = await axios.get(url);
  const info = (data?.data || []).find((item) => item.currency === "heco");
  return Number(info.tvl);
}

//okex
async function okex() {
  const data = await axios.get(url);
  const info = (data?.data || []).find((item) => item.currency === "okexchain");
  return Number(info.tvl);
}

async function fetch() {
  const bscTvl = await bsc();
  const okexTvl = await okex();
  const hecoTvl = await heco();
  const total = bscTvl + okexTvl + hecoTvl;
  return total;
}

module.exports = {
  bsc: {
    fetch: bsc,
  },
  okexchain: {
    fetch: okex,
  },
  heco: {
    fetch: heco,
  },
  fetch,
  name: "Flux Project",
};
