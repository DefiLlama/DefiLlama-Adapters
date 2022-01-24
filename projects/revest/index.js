const { default: axios } = require("axios");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {
  transformFantomAddress,
  transformAvaxAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens.js");

const holder = "0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F";

async function mainnetTVL(time, block) {
  const tokens = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address"
  );
  const balances = {};
  await sumTokensAndLPsSharedOwners(
    balances,
    tokens.data.body.map((t) => [t, false]),
    [holder],
    block
  );
  return balances;
}

async function polygonTVL(time, block) {
  const tokens = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=137"
  );
  const balances = {};
  const transform = await transformPolygonAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    tokens.data.body.map((t) => [t, false]),
    [holder],
    block["polygon"],
    "polygon",
    transform
  );
  return balances;
}

async function fantomTVL(time, block) {
  const tokens = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=250"
  );
  const balances = {};
  const transform = await transformFantomAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    tokens.data.body.map((t) => [t, false]),
    [holder],
    block["fantom"],
    "fantom",
    transform
  );
  return balances;
}

async function avaxTVL(time, block) {
  const tokens = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=43114"
  );
  const balances = {};
  const transform = await transformAvaxAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    tokens.data.body.map((t) => [t, false]),
    [holder],
    block["avax"],
    "avax",
    transform
  );
  return balances;
}

function sumTvl(tvlList = []) {
  return async (...args) => {
    const results = await Promise.all(tvlList.map((fn) => fn(...args)));
    return results.reduce((a, c) => Object.assign(a, c), {});
  };
}

module.exports = {
  methodology: "We list all tokens in our vault and sum them together",
  ethereum: {
    tvl: mainnetTVL,
  },
  polygon: {
    tvl: polygonTVL,
  },
  fantom: {
    tvl: fantomTVL,
  },
  avalanche: {
    tvl: avaxTVL,
  },
  tvl: sumTvl([mainnetTVL, polygonTVL, fantomTVL, avaxTVL]),
};
