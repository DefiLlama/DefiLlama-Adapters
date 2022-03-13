const axios = require("axios");

let url = "https://adminv1.knit.finance/api/tvl";

async function fetchBsc() {
  let bsc = await axios.get(`${url}/bsc`);
  return bsc.data.data.data.tvl.bsc;
}

async function fetchPoly() {
  let poly = await axios.get(`${url}/matic`);
  return poly.data.data.data.tvl.matic;
}

async function fetchEth() {
  let eth = await axios.get(`${url}/eth`);
  return eth.data.data.data.tvl.eth;
}

async function fetchFantom() {
  let fantom = await axios.get(`${url}/fantom`);
  return fantom.data.data.data.tvl.fantom;
}

async function fetchHeco() {
  let heco = await axios.get(`${url}/heco`);
  return heco.data.data.data.tvl.heco;
}

async function fetch() {
  let poly = await axios.get(`${url}/matic`),
    bsc = await axios.get(`${url}/bsc`),
    eth = await axios.get(`${url}/eth`),
    fantom = await axios.get(`${url}/fantom`),
    heco = await axios.get(`${url}/heco`);
  const tvl =
    bsc.data.data.data.tvl.bsc +
    poly.data.data.data.tvl.matic +
    eth.data.data.data.tvl.eth +
    fantom.data.data.data.tvl.fantom +
    heco.data.data.data.tvl.heco;
  return tvl;
}

module.exports = {
  polygon: {
    fetch: fetchPoly,
  },
  bsc: {
    fetch: fetchBsc,
  },
  ethereum: {
    fetch: fetchEth,
  },
  heco: {
    fetch: fetchHeco,
  },
  fantom: {
    fetch: fetchFantom,
  },

  fetch,
};
