const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const arbLendingPools = [
  [
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0xedd1efa76fe59e9106067d824b89b59157c5223c",
  ], // WETH
  [
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    "0xFEaDE428e2Fe0F547d560B540a7617087505538B",
  ], // USDC
  [
    "0x912ce59144191c1204e64559fe8253a0e49e6548",
    "0x4d5043d90f13ac2E6318B3aF9C3423A5224b920C",
  ], // ARB
];

const arbVaults = [
  [
    [
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a", // GMX
      "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
    ],
    "0x8610D60f5329B0560c8F0CEb80175F342fe943F3", // vault
  ],
];

async function arbTvl(_, _b, _cb, { api }) {
  await sumTokens2({ api, ownerTokens: arbVaults });
  const logs = await getLogs({
    api,
    target: "0x8a908ec03e2610fa8dcaec93bb010560780ec860",
    topics: [
      "0x647c6c21d1279361153a5cf7618a50b9573a9729986f26d91c8a7e6501750f6f",
    ],
    fromBlock: 49135720,
  });

  const pools = logs.map((i) => getAddress(i.topics[1]));
  const wantTokens = logs.map((i) => getAddress(i.data));

  await sumTokens2({ api, owners: pools, resolveUniV3: true });
  const tokensAndOwners = wantTokens.map((i, idx) => [i, pools[idx]]);
  tokensAndOwners.push(...arbLendingPools);
  return sumTokens2({ api, tokensAndOwners });
}

const polygonLendingPools = [
  [
    "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    "0x8610D60f5329B0560c8F0CEb80175F342fe943F3",
  ], // WETH
  [
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    "0xEdD1efA76fe59e9106067D824b89B59157C5223C",
  ], // WMATIC
];

const polygonVaults = [
  [
    [
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
      "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", // WETH
    ],
    "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859", // vault
  ],
];

async function polygonTvl(_, _b, _cb, { api }) {
  await sumTokens2({ api, ownerTokens: polygonVaults });
  const logs = await getLogs({
    api,
    target: "0x8a908ec03e2610fa8dcaec93bb010560780ec860",
    topics: [
      "0x647c6c21d1279361153a5cf7618a50b9573a9729986f26d91c8a7e6501750f6f",
    ],
    fromBlock: 49135720,
  });

  const pools = logs.map((i) => getAddress(i.topics[1]));
  const wantTokens = logs.map((i) => getAddress(i.data));

  await sumTokens2({ api, owners: pools, resolveUniV3: true });
  const tokensAndOwners = wantTokens.map((i, idx) => [i, pools[idx]]);
  tokensAndOwners.push(...polygonLendingPools);
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  arbitrum: {
    tvl: arbTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
};
