const utils = require("./helper/utils");

async function eth() {
  let staked = await utils.fetchURL("https://api.curve.fi/api/getTVL");
  let factory = await utils.fetchURL("https://api.curve.fi/api/getFactoryTVL");
  return staked.data.data.tvl + factory.data.data.factoryBalances;
}

async function polygon() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLPolygon");
  return tvl.data.data.tvl;
}

async function fantom() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLFantom");
  return tvl.data.data.tvl;
}

async function fetch() {
  return (await eth()) + (await polygon()) + (await fantom());
}

module.exports = {
  fantom: {
    fetch: fantom,
  },
  ethereum: {
    fetch: eth,
  },
  polygon: {
    fetch: polygon,
  },
  fetch,
};
