const sdk = require("@defillama/sdk");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
};

/** @type {Record<string, { auditor: string, start: number }>} */
const config = {
  ethereum: {
    auditor: "0x310A2694521f75C7B2b64b5937C16CE65C3EFE01",
    start: 15_868_410,
  },
  optimism: {
    auditor: "0xaEb62e6F27BC103702E7BC879AE98bceA56f027E",
    start: 78_310_663,
  }
};

Object.entries(config).forEach(([chain, { auditor, start }]) => {
  module.exports[chain] = {
    start,
    /** @type {(timestamp: number, block: number, chainBlocks: Record<string, number>, { api: ChainApi }) => Promise<Balances>} */
    tvl: async (api) => {
      /** @type {Balances} */
      const balances = {};
      const data = await markets(api, auditor);
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
    borrowed: async (api) => {
      /** @type {Balances} */
      const balances = {};
      const data = await markets(api, auditor);
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

/** @type {(api: ChainApi, auditor: string) => Promise<[string, string, string, FixedPool[]][]>} */
async function markets(api, auditor) {
  /** @type {string[]} */
  const markets = await api.call({ abi: abis.allMarkets, target: auditor });
  const timestamp = api.timestamp ?? 0;

  /** @type {string[][]} */
  const [asset, totalAssets, totalFloatingBorrowAssets, maxFuturePools] = await Promise.all(
    ["asset", "totalAssets", "totalFloatingBorrowAssets", "maxFuturePools"].map((key) =>
      api.multiCall({ abi: abis[key], calls: markets })
    )
  );
  const maxPools = maxFuturePools.reduce((max, n) => Math.max(max, +n), 0);
  const minMaturity = timestamp - (timestamp % INTERVAL) - INTERVAL * (maxPools - 1);
  const maturities = [...Array(2 * maxPools)].map((_, i) => minMaturity + INTERVAL * i);
  /** @type {FixedPool[]} */
  const fixedPools = await api.multiCall({
    abi: abis.fixedPools,
    calls: markets.flatMap((target) => maturities.map((params) => ({ target, params }))),
  });
  return markets.map((_, i) => [
    asset[i],
    totalAssets[i],
    totalFloatingBorrowAssets[i],
    fixedPools.slice(i * maturities.length, (i + 1) * maturities.length),
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
