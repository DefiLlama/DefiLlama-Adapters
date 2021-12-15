const { default: axios } = require("axios");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const holder = "0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F";

async function tvl(time, block) {
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
  await sumTokensAndLPsSharedOwners(
    balances,
    tokens.data.body.map((t) => [t, false]),
    [holder],
    block
  );
  return balances;
}

async function fantomTVL(time, block) {
  const tokens = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=250"
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

async function avaxTVL(time, block) {
  const tokens = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=43114"
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

module.exports = {
  methodology: "We list all tokens in our vault and sum them together",
  ethereum: {
    tvl,
  },
  polygon: {
    polygonTVL,
  },
  fantom: {
    fantomTVL,
  },
  avalanche: {
    avaxTVL,
  },
};
