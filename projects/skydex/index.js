const { sumTokens2 } = require("../helper/unwrapLPs");

const pools = [
   "0xe59eA42466f3dD0ea620A622701085983A068863",
  "0x33b4424A65cfE19CDf0Dff4E54e399782327a1b6",
];

const basePools = [
   "0x40e004A3312259EE0cA3F457d67D13d4FEec311E",
  "0xBDA235257f1cFb3833594cB8faE394BC1826caD3",
];

const blacklistedTokens = []

async function tvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  const tokensArray = await api.multiCall({  abi: "address[]:getTokens", calls: pools})
  const tokens = tokensArray.flat()
  const calls = tokensArray.map((t, i)=> t.map((token) => ({ target: pools[i], params: token }))).flat()
  const owners = await api.multiCall({  abi:"function assetOf(address) view returns (address)", calls})
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens });
}

async function baseTvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  const tokensArray = await api.multiCall({  abi: "address[]:getTokens", calls: basePools})
  const tokens = tokensArray.flat()
  const calls = tokensArray.map((t, i)=> t.map((token) => ({ target: basePools[i], params: token }))).flat()
  const owners = await api.multiCall({  abi:"function assetOf(address) view returns (address)", calls})
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens });
}

module.exports = {
  era: {
    tvl,
  },
  base: {
    baseTvl,
  },
};
