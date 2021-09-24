// import { providers, Contract } from "ethers";
const axios = require("axios");
const url = "https://gateway.api.01defi.com/base/fluxTvl/get";

// bsc
async function bsc() {
  const data = await axios.get(url);
  const info = (data?.data?.data?.detail || []).find(
    (item) => item.chain === "bsc"
  );
  return Number(info.lendingTVL);
}
// heco
async function heco() {
  const data = await axios.get(url);
  const info = (data?.data?.data?.detail || []).find(
    (item) => item.chain === "heco"
  );
  return Number(info.lendingTVL);
}

//okex
async function okex() {
  const data = await axios.get(url);
  const info = (data?.data?.data?.detail || []).find(
    (item) => item.chain === "okexchain"
  );
  return Number(info.lendingTVL);
}

//conflux
async function conflux() {
  const data = await axios.get(url);
  const info = (data?.data?.data?.detail || []).find(
    (item) => item.chain === "conflux"
  );
  return Number(info.lendingTVL);
}

//arbitrum
async function arbitrum() {
  const data = await axios.get(url);
  const info = (data?.data?.data?.detail || []).find(
    (item) => item.chain === "arbitrum"
  );
  return Number(info.lendingTVL);
}

//polygon
async function polygon() {
  const data = await axios.get(url);
  const info = (data?.data?.data?.detail || []).find(
    (item) => item.chain === "polygon"
  );
  return Number(info.lendingTVL);
}

//total
async function fetch() {
  const data = await axios.get(url);
  return Number(data?.data?.data?.lendingTVL);
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
  arbitrum: {
    fetch: arbitrum,
  },
  polygon: {
    fetch: polygon,
  },
  fetch,
  name: "Flux Project",
};
