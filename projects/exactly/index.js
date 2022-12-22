const { api2 } = require("@defillama/sdk");
const {
  MULTICALL_ADDRESS_MAINNET,
} = require("@defillama/sdk/build/abi/multicall");
const {
  utils: { Interface },
  Contract,
} = require("ethers");

const marketABI = new Interface([
  "function asset() view returns (address)",
  "function fixedPools(uint256) view returns ((uint256 borrowed, uint256 supplied, uint256, uint256))",
  "function maxFuturePools() view returns (uint8)",
  "function totalAssets() view returns (uint256)",
  "function totalFloatingBorrowAssets() view returns (uint256)",
]);

/** @type {(chain: string, timestamp: number, block: number) => Promise<Market[]>} */
const markets = async (chain, timestamp, block) => {
  const { [chain]: provider } = api2.config.providers;
  const auditor = new Contract(
    {
      ethereum: "0x310A2694521f75C7B2b64b5937C16CE65C3EFE01",
    }[chain],
    ["function allMarkets() view returns (address[])"],
    provider
  );
  const multicall = new Contract(
    {
      ethereum: MULTICALL_ADDRESS_MAINNET,
    }[chain],
    ["function aggregate((address,bytes)[]) view returns (uint256, bytes[])"],
    provider
  );

  /** @type {string[]} */
  const markets = await auditor.allMarkets({ blockTag: block });

  const getters = [
    "asset",
    "maxFuturePools",
    "totalAssets",
    "totalFloatingBorrowAssets",
  ];
  /** @type {[BigNumber, string[]]} */
  const [, gettersData] = await multicall.aggregate(
    markets.flatMap((market) =>
      getters.map((fn) => [market, marketABI.encodeFunctionData(fn)])
    ),
    { blockTag: block }
  );

  const marketData = markets.map((market, i) => {
    /** @type {[string, number, BigNumber, BigNumber]} */
    // @ts-expect-error tuple
    const [asset, maxFuturePools, totalAssets, totalFloatingBorrowAssets] =
      gettersData
        .slice(i * getters.length, (i + 1) * getters.length)
        .map((d, j) => marketABI.decodeFunctionResult(getters[j], d)[0]);
    return {
      asset,
      market,
      maxFuturePools,
      totalFloatingBorrowAssets: totalFloatingBorrowAssets.toBigInt(),
      totalFloatingDepositAssets: totalAssets.toBigInt(),
    };
  });

  const INTERVAL = 86_400 * 7 * 4;
  const maxFuturePools = marketData.reduce(
    (max, { maxFuturePools }) => Math.max(max, maxFuturePools),
    0
  );
  /** @type {[BigNumber, string[]]} */
  const [, fixedPoolsData] = await multicall.aggregate(
    marketData.flatMap(
      ({ market }) =>
        [...Array(maxFuturePools)].map((_, i) => [
          market,
          marketABI.encodeFunctionData("fixedPools", [
            timestamp - (timestamp % INTERVAL) + INTERVAL * (i + 1),
          ]),
        ]),
      { blockTag: block }
    )
  );

  return marketData.map(
    ({ asset, totalFloatingBorrowAssets, totalFloatingDepositAssets }, i) => ({
      asset,
      fixedPools: fixedPoolsData
        .slice(i * maxFuturePools, (i + 1) * maxFuturePools)
        .map((data) => {
          /** @type {{ borrowed: BigNumber, supplied: BigNumber }} */
          const { borrowed, supplied } = marketABI.decodeFunctionResult(
            "fixedPools",
            data
          )[0];
          return {
            borrowed: borrowed.toBigInt(),
            supplied: supplied.toBigInt(),
          };
        }),
      totalFloatingBorrowAssets,
      totalFloatingDepositAssets,
    })
  );
};

/** @type {(chain: string) => (timestamp: number, block: number, chainBlocks: Record<string, number>) => Promise<Record<string, bigint>>} */
const tvl =
  (chain) =>
  async (timestamp, _, { [chain]: block }) =>
    Object.fromEntries(
      await Promise.all(
        Object.values(await markets(chain, timestamp, block)).map(
          async ({
            asset,
            fixedPools,
            totalFloatingBorrowAssets,
            totalFloatingDepositAssets,
          }) => {
            return [
              asset,
              fixedPools.reduce(
                (total, { borrowed, supplied }) => total + supplied - borrowed,
                0n
              ) +
                totalFloatingDepositAssets -
                totalFloatingBorrowAssets,
            ];
          }
        )
      )
    );

/** @type {(chain: string) => (timestamp: number, block: number, chainBlocks: Record<string, number>) => Promise<Record<string, bigint>>} */
const borrowed =
  (chain) =>
  async (timestamp, _, { [chain]: block }) =>
    Object.fromEntries(
      await Promise.all(
        Object.values(await markets(chain, timestamp, block)).map(
          async ({ asset, fixedPools, totalFloatingBorrowAssets }) => {
            return [
              asset,
              fixedPools.reduce((total, { borrowed }) => total + borrowed, 0n) +
                totalFloatingBorrowAssets,
            ];
          }
        )
      )
    );

module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
  ethereum: {
    start: 15868410,
    tvl: tvl("ethereum"),
    borrowed: borrowed("ethereum"),
  },
};

/** @typedef {import("ethers").BigNumber} BigNumber */
/** @typedef {{ borrowed: bigint, supplied: bigint }} FixedPool */
/**
 * @typedef Market
 * @property {string} asset
 * @property {FixedPool[]} fixedPools
 * @property {bigint} totalFloatingBorrowAssets
 * @property {bigint} totalFloatingDepositAssets
 */
