const { sumTokens2 } = require("../helper/unwrapLPs");

const pools = [
   "0xe59eA42466f3dD0ea620A622701085983A068863",
  "0x33b4424A65cfE19CDf0Dff4E54e399782327a1b6",
];

const blacklistedTokens = []

async function tvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  const tokensArray = await api.multiCall({  abi: "address[]:getTokens", calls: pools})
  const tokens = tokensArray.flat()
  const calls = tokensArray.map((t, i)=> t.map((token) => ({ target: pools[i], params: token }))).flat()
  const owners = await api.multiCall({  abi:"function assetOf(address) view returns (address)", calls})
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens });
}

module.exports = {
  era: {
    tvl,
  },
};
