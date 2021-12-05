const utils = require("../helper/utils");
// Please refer to Github(https://github.com/kukafe/kafe-defillama/tree/main/kafe-defillama) for the codes to calculate the TVL via on-chain calls
const apiUrl = "http://142.93.53.244:5001/getTvl";

async function fetchChain(chain, includePool2) {
  let totalTvl = 0;
  let response = (await utils.fetchURL(apiUrl)).data;
  Object.keys(response).forEach((key) => {
    let entry = response[key];
    if (entry.chain !== chain) return;
    if (includePool2 == false) {
      if (key.startsWith("KAFE")) return;
    } else {
      if (!key.startsWith("KAFE")) return;
      if (key.startsWith("KAFE") && key.endsWith("KAFE")) return;
    }
    totalTvl = totalTvl + Number(entry.TVL);
  });
  return Math.round(totalTvl);
}

async function fetchCronos() {
  return fetchChain("cronos", false);
}

async function fetchMoonriver() {
  return fetchChain("moonriver", false);
}

async function fetchMoonRiverPool2() {
  return fetchChain("moonriver", true);
}

async function fetchMoonriverStaking() {
  let response = (await utils.fetchURL(apiUrl)).data;
  return Math.round(Number(response["KAFE"].TVL));
}

async function fetch() {
  let cronosTvl = await fetchChain("cronos", false);
  let moonriverTvl = await fetchChain("moonriver", false);
  return cronosTvl + moonriverTvl;
}

module.exports = {
  cronos: {
    fetch: fetchCronos,
  },
  moonriver: {
    fetch: fetchMoonriver,
  },
  pool2: {
    fetch: fetchMoonRiverPool2,
  },
  staking: {
    fetch: fetchMoonriverStaking,
  },
  fetch,
};
