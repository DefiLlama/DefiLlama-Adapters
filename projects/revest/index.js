const { default: axios } = require("axios");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {
  transformFantomAddress,
  transformAvaxAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens.js");

const HOLDERS = {
  1: "0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F",
  137: "0x3cCc20d960e185E863885913596b54ea666b2fe7",
  250: "0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf",
  43114: "0x955a88c27709a1EEf4ACa0df0712c67B48240919",
};

async function mainnetTVL(time, block) {
  const tokens = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address"
  );
  const balances = {};
  let holder = HOLDERS[1];
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
  let holder = HOLDERS[137];
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
  let holder = HOLDERS[250];
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
  let holder = HOLDERS[43114];
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
