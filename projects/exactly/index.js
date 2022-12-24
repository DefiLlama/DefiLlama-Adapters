const sdk = require("@defillama/sdk");

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
};

/** @type {Record<string, { auditor: string, startTimestamp: number }>} */
const config = {
  ethereum: {
    auditor: "0x310A2694521f75C7B2b64b5937C16CE65C3EFE01",
    startTimestamp: 1667223731,
  },
};

Object.entries(config).forEach(([chain, { auditor, startTimestamp }]) => {
  module.exports[chain] = {
    /** @type {(timestamp: number, block: number, chainBlocks: Record<string, number>, { api: ChainApi }) => Promise<Balances>} */
    tvl: async (_, __, ___, { api }) => {
      /** @type {Balances} */
      const balances = {};
      const data = await markets(api, auditor, startTimestamp);
      data.forEach(([asset, totalAssets, totalFloatingBorrowAssets, fixedPools]) => {
        sdk.util.sumSingleBalance(balances, asset, totalAssets, chain);
        sdk.util.sumSingleBalance(balances, asset, -1 * +totalFloatingBorrowAssets, chain);
        fixedPools.forEach(({ borrowed, supplied }) => {
          sdk.util.sumSingleBalance(balances, asset, supplied, chain);
          sdk.util.sumSingleBalance(balances, asset, -1 * +borrowed, chain);
        });
      });
      return balances;
    },
    /** @type {(timestamp: number, block: number, chainBlocks: Record<string, number>, { api: ChainApi }) => Promise<Balances>} */
    borrowed: async (_, __, ___, { api }) => {
      /** @type {Balances} */
      const balances = {};
      const data = await markets(api, auditor, startTimestamp);
      data.forEach(([asset, , totalFloatingBorrowAssets, fixedPools]) => {
        sdk.util.sumSingleBalance(balances, asset, totalFloatingBorrowAssets, chain);
        fixedPools.forEach(({ borrowed }) => {
          sdk.util.sumSingleBalance(balances, asset, borrowed, chain);
        });
      });
      return balances;
    },
  };
});

const INTERVAL = 86_400 * 7 * 4;

/** @type {(api: ChainApi, auditor: string, startTimestamp: number) => Promise<[string, string, string, FixedPool[]][]>} */
async function markets(api, target, startTimestamp) {
  /** @type {string[]} */
  const markets = await api.call({ abi: abis.allMarkets, target });
  const timestamp = api.timestamp ?? 0;

  /** @type {string[][]} */
  const [asset, totalAssets, totalFloatingBorrowAssets, maxFuturePools] = await Promise.all(
    ["asset", "totalAssets", "totalFloatingBorrowAssets", "maxFuturePools"].map((key) =>
      api.multiCall({ abi: abis[key], calls: markets })
    )
  );
  const minMaturity = startTimestamp - (startTimestamp % INTERVAL) + INTERVAL;
  const maxMaturity =
    timestamp - (timestamp % INTERVAL) + INTERVAL * maxFuturePools.reduce((max, n) => Math.max(max, +n), 0);
  const fixedPoolCount = (maxMaturity - minMaturity) / INTERVAL + 1;
  const maturities = [...Array(fixedPoolCount)].map((_, i) => minMaturity + INTERVAL * i);
  /** @type {FixedPool[]} */
  const fixedPools = await api.multiCall({
    abi: abis.fixedPools,
    calls: markets.flatMap((target) => maturities.map((params) => ({ target, params }))),
  });
  return markets.map((_, i) => [
    asset[i],
    totalAssets[i],
    totalFloatingBorrowAssets[i],
    fixedPools.slice(i * fixedPoolCount, (i + 1) * fixedPoolCount),
  ]);
}

const abis = {
  allMarkets: "function allMarkets() view returns (address[])",
  asset: "function asset() view returns (address)",
  fixedPools: "function fixedPools(uint256) view returns ((uint256 borrowed, uint256 supplied, uint256, uint256))",
  maxFuturePools: "function maxFuturePools() view returns (uint8)",
  totalAssets: "function totalAssets() view returns (uint256)",
  totalFloatingBorrowAssets: "function totalFloatingBorrowAssets() view returns (uint256)",
};

/** @typedef {import("@defillama/sdk").ChainApi} ChainApi */
/** @typedef {import("@defillama/sdk/build/types").Balances} Balances */
/** @typedef {{ borrowed: string, supplied: string }} FixedPool */
