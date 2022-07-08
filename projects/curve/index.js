const { staking } = require("../helper/staking");
const utils = require("../helper/utils");

async function eth() {
  let staked = await utils.fetchURL("https://api.curve.fi/api/getTVL"); //base stable pools
  let factory = await utils.fetchURL(
    "https://api.curve.fi/api/getPools/ethereum/factory"
  ); //stable facto pools
  let factoryCrypto = await utils.fetchURL(
    "https://api.curve.fi/api/getFactoryCryptoPools/ethereum"
  ); //facto crypto pools
  let baseCrypto = await utils.fetchURL(
    "https://api.curve.fi/api/getTVLCrypto"
  ); //base crypto pools

  return (
    staked.data.data.tvl +
    factory.data.data.tvl +
    factoryCrypto.data.data.tvl +
    baseCrypto.data.data.tvl
  );
}

async function polygon() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLPolygon");
  return tvl.data.data.tvl;
}

async function aurora() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLAurora");
  return tvl.data.data.tvl;
}

async function fantom() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLFantom");
  return tvl.data.data.tvl;
}

async function xdai() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLxDai");
  return tvl.data.data.tvl;
}

async function arbitrum() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLArbitrum");
  return tvl.data.data.tvl;
}

async function avax() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLAvalanche");
  return tvl.data.data.tvl;
}

async function harmony() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLHarmony");
  return tvl.data.data.tvl;
}

async function optimism() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLOptimism");
  return tvl.data.data.tvl;
}

async function moonbeam() {
  const tvl = await utils.fetchURL("https://api.curve.fi/api/getTVLMoonbeam");
  return tvl.data.data.tvl;
}

async function fetch() {
  return (
    (await eth()) +
    (await polygon()) +
    (await fantom()) +
    (await xdai()) +
    (await arbitrum()) +
    (await avax()) +
    (await harmony()) +
    (await optimism())
  );
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  fantom: {
    fetch: fantom
  },
  ethereum: {
    staking: staking(
      "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2",
      "0xD533a949740bb3306d119CC777fa900bA034cd52"
    ),
    fetch: eth
  },
  polygon: {
    fetch: polygon
  },
  xdai: {
    fetch: xdai
  },
  arbitrum: {
    fetch: arbitrum
  },
  avalanche: {
    fetch: avax
  },
  moonbeam: {
    fetch: moonbeam
  },
  harmony: {
    fetch: harmony
  },
  optimism: {
    fetch: optimism
  },
  aurora: {
    fetch: aurora
  },
  fetch
};
