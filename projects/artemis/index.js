const { default: axios } = require("axios");
const retry = require("../helper/retry");

const farmApi = "https://api.elision.farm/getFarmStats/harmony/artemis";

async function harmonyTvl() {
  let tvl = 0;
  let { data: farms } = await retry(async (bail) => await axios.get(farmApi));
  for (let i = 0; i < farms.length; i++) {
    if (!farms[i].name.startsWith("MIS") && !farms[i].name.endsWith("MIS")) {
      tvl += farms[i].farm_liquidity_usd;
    }
  }
  return tvl;
}

async function harmonyPool2Tvl() {
  let tvl = 0;
  let { data: farms } = await retry(async (bail) => await axios.get(farmApi));
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].name.startsWith("MIS") || farms[i].name.endsWith("MIS")) {
      tvl += farms[i].farm_liquidity_usd;
    }
  }
  return tvl;
}

module.exports = {
  harmony: {
    fetch: harmonyTvl,
  },
  pool2: {
    fetch: harmonyPool2Tvl,
  },
  fetch: harmonyTvl,
};
