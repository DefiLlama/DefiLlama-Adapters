const { default: axios } = require("axios");
const retry = require("../helper/retry");

const farmApi = "https://api.elision.farm/getFarmStats/harmony/farmersonlyfi";
const vaultApi = "https://api.elision.farm/getFarmStats/harmony/farmersonlyfi-vault";

async function getFarmTvl(category) {
  let { data: farms } = await retry(async (bail) => await axios.get(farmApi));
  let tvl = getTvl(farms, category);
  return tvl;
}

async function getVaultTvl(category) {
  let { data: vaults } = await retry(async (bail) => await axios.get(vaultApi));
  let tvl = getTvl(vaults, category);
  return tvl;
}

async function getTvl(data, category) {
  let tvl = 0;
  for (let i = 0; i < data.length; i++) {
    switch (category) {
      case "pool2":
        if (data[i].name.startsWith("FOX")) {
          tvl += data[i].farm_liquidity_usd;
        }
        break;
      case "staking":
        if (data[i].name === "FOX POOL") {
          return data[i].farm_liquidity_usd;
        }
        break;
      default:
        if (data[i].name !== "FOX POOL" && !data[i].name.startsWith("FOX")) {
          tvl += data[i].farm_liquidity_usd;
        }
        break;
    }
  }
  return tvl;
}

async function harmonyTvl() {
  let farmTvl = await getFarmTvl();
  let vaultTvl = await getVaultTvl();
  return farmTvl + vaultTvl;
}

async function pool2() {
  let farmTvl = await getFarmTvl("pool2");
  let vaultTvl = await getVaultTvl("pool2");
  return farmTvl + vaultTvl;
}

async function staking() {
  let farmTvl = await getFarmTvl("staking");
  let vaultTvl = await getVaultTvl("staking");
  return farmTvl + vaultTvl;
}

module.exports = {
  harmony: {
    fetch: harmonyTvl,
  },
  pool2: {
    fetch: pool2,
  },
  staking: {
    fetch: staking,
  },
  fetch : harmonyTvl

};
