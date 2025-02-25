const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const config = {
  arbitrum: {
    proxyDeployer: "0x8a908ec03e2610fa8dcaec93bb010560780ec860",
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
        ADDRESSES.arbitrum.ARB,
        "0x4d5043d90f13ac2E6318B3aF9C3423A5224b920C",
      ], // ARB
    ],
    balanceVault: [
      [
        [
          ADDRESSES.arbitrum.USDC, // USDC
          ADDRESSES.arbitrum.GMX, // GMX
          ADDRESSES.arbitrum.ARB, // ARB
        ],
        "0x8610D60f5329B0560c8F0CEb80175F342fe943F3", // vault
      ],
    ],
    fromBlock: 49135720,
  },
  bsc: {
    proxyDeployer: "0xD8006420c1b2901849505eb3517cc36a169AE0A7",
    lendingPools: [
      [
        "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "0x8610D60f5329B0560c8F0CEb80175F342fe943F3",
      ], // CAKE
    ],
    balanceVault: [
      [
        [
          ADDRESSES.bsc.USDT, // USDT
          ADDRESSES.bsc.BUSD, // BUSD
          ADDRESSES.bsc.WBNB, // WBNB
          "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", // CAKE
        ],
        "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859", // vault
      ],
    ],
    fromBlock: 28688279,
  }
}

async function tvl(api) {
  const { balanceVault, lendingPools, fromBlock, proxyDeployer } = config[api.chain]
  const logs = await getLogs({
    api, fromBlock,
    target: proxyDeployer,
    topics: ["0x647c6c21d1279361153a5cf7618a50b9573a9729986f26d91c8a7e6501750f6f",],
  });

  const factories = logs.map((i) => getAddress(i.topics[1]));
  const wantTokens = logs.map((i) => getAddress(i.data));

  await sumTokens2({ api, owners: factories, resolveUniV3: true });
  const tokensAndOwners = wantTokens.map((i, idx) => [i, factories[idx]]);
  tokensAndOwners.push(...lendingPools)
  balanceVault.forEach(([tokens, vault]) => tokens.forEach(i => tokensAndOwners.push([i, vault])))
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  doublecounted: true,
  arbitrum: { tvl },
  bsc: { tvl }
}
