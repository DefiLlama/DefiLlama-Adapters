const { sumTokens2 } = require("../helper/unwrapLPs");

const FACTORY = "0x89687777012E7FF91a6ecDDDc0aebAb38BbC098A";

const factoryAbi = {
  inputs: [],
  name: "allPairsLength",
  outputs: [{ type: "uint256" }],
  stateMutability: "view",
  type: "function",
};

const allPairsAbi = {
  inputs: [{ name: "", type: "uint256" }],
  name: "allPairs",
  outputs: [{ type: "address" }],
  stateMutability: "view",
  type: "function",
};

const pairToken0Abi = {
  inputs: [],
  name: "token0",
  outputs: [{ type: "address" }],
  stateMutability: "view",
  type: "function",
};

const pairToken1Abi = {
  inputs: [],
  name: "token1",
  outputs: [{ type: "address" }],
  stateMutability: "view",
  type: "function",
};

async function tvl(api) {
  const pairCount = Number(
    await api.call({
      target: FACTORY,
      abi: factoryAbi,
    })
  );

  const pairs = await api.multiCall({
    target: FACTORY,
    abi: allPairsAbi,
    calls: Array.from({ length: pairCount }, (_, i) => ({ params: [i] })),
  });

  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: pairToken0Abi, calls: pairs }),
    api.multiCall({ abi: pairToken1Abi, calls: pairs }),
  ]);

  const tokensAndOwners = [];

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const token0 = token0s[i];
    const token1 = token1s[i];

    if (token0 && token0 !== '0x0000000000000000000000000000000000000000')
      tokensAndOwners.push([token0.toLowerCase(), pair.toLowerCase()]);

    if (token1 && token1 !== '0x0000000000000000000000000000000000000000')
      tokensAndOwners.push([token1.toLowerCase(), pair.toLowerCase()]);
  }

  return sumTokens2({
    api,
    tokensAndOwners,
  });
}

module.exports = {
  methodology:
    "Tracks tokens held by LobsterSwap liquidity pools on OzoneChain.",

  ozo: {
    tvl,
  },
};