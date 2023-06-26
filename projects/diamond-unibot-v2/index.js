const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const config = {
  arbitrum: {
    lendingPools: [
      [
        ADDRESSES.arbitrum.WETH,
        "0xedd1efa76fe59e9106067d824b89b59157c5223c",
      ], // WETH
      [
        ADDRESSES.arbitrum.USDC,
        "0xFEaDE428e2Fe0F547d560B540a7617087505538B",
      ], // USDC
      [
        "0x912ce59144191c1204e64559fe8253a0e49e6548",
        "0x4d5043d90f13ac2E6318B3aF9C3423A5224b920C",
      ], // ARB
    ],
    vaults: [
      [
        [
          ADDRESSES.arbitrum.USDC, // USDC
          ADDRESSES.arbitrum.GMX, // GMX
          "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
        ],
        "0x8610D60f5329B0560c8F0CEb80175F342fe943F3", // vault
      ],
    ],
    fromBlock: 49135720,
  },
  polygon: {
    lendingPools: [
      [
        ADDRESSES.polygon.WETH_1,
        "0x8610D60f5329B0560c8F0CEb80175F342fe943F3",
      ], // WETH
      [
        ADDRESSES.polygon.WMATIC_2,
        "0xEdD1efA76fe59e9106067D824b89B59157C5223C",
      ], // WMATIC
    ],
    vaults: [
      [
        [
          ADDRESSES.polygon.USDC, // USDC
          ADDRESSES.polygon.WETH_1, // WETH
        ],
        "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859", // vault
      ],
    ],
    fromBlock: 49135720,
  }
}

async function tvl(_, _b, _cb, { api }) {
  const { vaults, lendingPools, fromBlock, } = config[api.chain]

  const logs = await getLogs({
    api, fromBlock,
    target: "0x8a908ec03e2610fa8dcaec93bb010560780ec860",
    topics: ["0x647c6c21d1279361153a5cf7618a50b9573a9729986f26d91c8a7e6501750f6f",],
  });

  const pools = logs.map((i) => getAddress(i.topics[1]));
  const wantTokens = logs.map((i) => getAddress(i.data));

  await sumTokens2({ api, owners: pools, resolveUniV3: true });
  const tokensAndOwners = wantTokens.map((i, idx) => [i, pools[idx]]);
  tokensAndOwners.push(...lendingPools)
  vaults.forEach(([tokens, vault]) => tokens.forEach(i => tokensAndOwners.push([i, vault])))
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  doublecounted: true,
  arbitrum: { tvl },
  polygon: { tvl },
}
