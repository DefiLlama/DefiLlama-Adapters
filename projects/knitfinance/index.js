const axios = require("axios");

let url = "https://adminv1.knit.finance/api/public/tvl";

async function fetchBsc() {
  let bsc = await axios.get(`${url}/bsc`);
  return bsc?.data?.data?.data?.tvl?.bsc;
}

async function fetchPoly() {
  let poly = await axios.get(`${url}/matic`);
  return poly?.data?.data?.data?.tvl?.matic;
}

async function fetchEth() {
  let eth = await axios.get(`${url}/eth`);
  return eth?.data?.data?.data?.tvl?.eth;
}

async function fetchFantom() {
  let fantom = await axios.get(`${url}/fantom`);
  return fantom?.data?.data?.data?.tvl?.fantom;
}

async function fetchHeco() {
  let heco = await axios.get(`${url}/heco`);
  return heco?.data?.data?.data?.tvl?.heco;
}

async function fetchAvax() {
  let avax = await axios.get(`${url}/avalanche`);
  return avax?.data?.data?.data?.tvl?.avalanche;
}

async function fetchKcc() {
  let kcc = await axios.get(`${url}/kcc`);
  return kcc?.data?.data?.data?.tvl?.kcc;
}

async function fetchHarmony() {
  let harmony = await axios.get(`${url}/harmony`);
  return harmony?.data?.data?.data?.tvl?.harmony;
}

async function fetchOkx() {
  let okx = await axios.get(`${url}/okexchain`);
  return okx?.data?.data?.data?.tvl?.okexchain;
}

async function fetchGNO() {
  let gc = await axios.get(`${url}/gnosis`);
  return gc?.data?.data?.data?.tvl?.gnosis;
}

async function fetchSysCoin() {
  let sys = await axios.get(`${url}/syscoin`);
  return sys?.data?.data?.data?.tvl?.syscoin;
}

async function fetchTlos() {
  let tlos = await axios.get(`${url}/telos`);
  return tlos?.data?.data?.data?.tvl?.telos;
}

async function fetchMoonriver() {
  let moonriver = await axios.get(`${url}/moonriver`);
  return moonriver?.data?.data?.data?.tvl?.moonriver;
}

async function fetchMilkoMeda() {
  let moonriver = await axios.get(`${url}/moonriver`);
  return moonriver?.data?.data?.data?.tvl?.moonriver;
}

async function fetchMoonbeam() {
  let moonbeam = await axios.get(`${url}/moonbeam`);
  return moonbeam?.data?.data?.data?.tvl?.moonbeam;
}

async function fetchBitgert() {
  let bitgert = await axios.get(`${url}/bitgert`);
  return bitgert?.data?.data?.data?.tvl?.bitgert;
}

async function fetchReef() {
  let reef = await axios.get(`${url}/reef`);
  return reef?.data?.data?.data?.tvl?.reef;
}

async function fetch() {
  let poly = await axios.get(`${url}/matic`),
    bsc = await axios.get(`${url}/bsc`),
    eth = await axios.get(`${url}/eth`),
    fantom = await axios.get(`${url}/fantom`),
    heco = await axios.get(`${url}/heco`),
    avax = await axios.get(`${url}/avalanche`),
    kcc = await axios.get(`${url}/kcc`),
    harmony = await axios.get(`${url}/harmony`),
    okx = await axios.get(`${url}/okexchain`),
    gc = await axios.get(`${url}/gnosis`),
    sys = await axios.get(`${url}/syscoin`),
    tlos = await axios.get(`${url}/telos`),
    moonriver = await axios.get(`${url}/moonriver`),
    milkomeda = await axios.get(`${url}/milkomeda`),
    moonbeam = await axios.get(`${url}/moonbeam`),
    bitgert = await axios.get(`${url}/bitgert`),
    reef = await axios.get(`${url}/reef`);
  const tvl =
    bsc?.data?.data?.data?.tvl?.bsc +
    poly?.data?.data?.data?.tvl?.matic +
    eth?.data?.data?.data?.tvl?.eth +
    fantom?.data?.data?.data?.tvl?.fantom +
    heco?.data?.data?.data?.tvl?.heco +
    avax?.data?.data?.data?.tvl?.avalanche +
    kcc?.data?.data?.data?.tvl?.kcc +
    harmony?.data?.data?.data?.tvl?.harmony +
    okx?.data?.data?.data?.tvl?.okexchain +
    gc?.data?.data?.data?.tvl?.gnosis +
    sys?.data?.data?.data?.tvl?.syscoin +
    tlos?.data?.data?.data?.tvl?.telos +
    moonriver?.data?.data?.data?.tvl?.moonriver +
    milkomeda?.data?.data?.data?.tvl?.milkomeda +
    moonbeam?.data?.data?.data?.tvl?.moonbeam +
    bitgert?.data?.data?.data?.tvl?.bitgert +
    reef?.data?.data?.data?.tvl?.reef;

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
  avalanche: {
    fetch: fetchAvax,
  },
  kcc: {
    fetch: fetchKcc,
  },
  harmony: {
    fetch: fetchHarmony,
  },
  okexchain: {
    fetch: fetchOkx,
  },
  syscoin: {
    fetch: fetchSysCoin,
  },
  telos: {
    fetch: fetchTlos,
  },
  moonriver: {
    fetch: fetchMoonriver,
  },
  milkomeda: {
    fetch: fetchMilkoMeda,
  },
  moonbeam: {
    fetch: fetchMoonbeam,
  },
  bitgert: {
    fetch: fetchBitgert,
  },
  xdai: {
    fetch: fetchGNO,
  },
  reef: {
    fetch: fetchReef,
  },
  fetch,
};
