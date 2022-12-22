const { api2 } = require("@defillama/sdk");
const {
  MULTICALL_ADDRESS_MAINNET,
} = require("@defillama/sdk/build/abi/multicall");
const { Contract } = require("@ethersproject/contracts");
const { Interface, FormatTypes } = require("@ethersproject/abi");

/** @type {Record<string, { start: number, auditor: string, multicall: string }>} */
const chains = {
  ethereum: {
    start: 15868410,
    auditor: "0x310A2694521f75C7B2b64b5937C16CE65C3EFE01",
    multicall: MULTICALL_ADDRESS_MAINNET,
  },
};

/** @type {(chain: string, timestamp: number, block: number) => Promise<Market[]>} */
const markets = async (chain, timestamp, block) => {
  const { [chain]: provider } = api2.config.providers;
  const auditor = new Contract(
    chains[chain].auditor,
    ["function allMarkets() view returns (address[])"],
    provider
  );
  const multicall = new Contract(
    chains[chain].multicall,
    ["function aggregate((address,bytes)[]) view returns (uint256, bytes[])"],
    provider
  );

  /** @type {[string[], { timestamp: number }]} */
  const [markets, { timestamp: startTimestamp }] = await Promise.all([
    auditor.allMarkets({ blockTag: block }),
    provider.getBlock(chains[chain].start),
  ]);

  const getters = [
    "asset",
    "maxFuturePools",
    "totalAssets",
    "totalFloatingBorrowAssets",
  ];
  /** @type {[BigNumber, string[]]} */
  const [, gettersData] = await multicall.aggregate(
    markets.flatMap((market) =>
      getters.map((fn) => [market, abi.encodeFunctionData(fn)])
    ),
    { blockTag: block }
  );

  const marketData = markets.map((market, i) => {
    /** @type {[string, number, BigNumber, BigNumber]} */
    // @ts-expect-error tuple
    const [asset, maxFuturePools, totalAssets, totalFloatingBorrowAssets] =
      gettersData
        .slice(i * getters.length, (i + 1) * getters.length)
        .map((d, j) => abi.decodeFunctionResult(getters[j], d)[0]);
    return {
      asset,
      market,
      maxFuturePools,
      totalFloatingBorrowAssets: totalFloatingBorrowAssets.toBigInt(),
      totalFloatingDepositAssets: totalAssets.toBigInt(),
    };
  });

  const INTERVAL = 86_400 * 7 * 4;
  const minMaturity = startTimestamp - (startTimestamp % INTERVAL) + INTERVAL;
  const maxMaturity =
    timestamp -
    (timestamp % INTERVAL) +
    INTERVAL *
      marketData.reduce(
        (max, { maxFuturePools }) => Math.max(max, maxFuturePools),
        0
      );
  const fixedPoolCount = (maxMaturity - minMaturity) / INTERVAL + 1;
  /** @type {{ borrowed: string, supplied: string }[]} */
  const fixedPools = await api2.abi.multiCall({
    abi: JSON.parse(abi.getFunction("fixedPools").format(FormatTypes.json)),
    calls: marketData.flatMap(({ market }) =>
      [...Array(fixedPoolCount)].map((_, i) => ({
        target: market,
        params: [minMaturity + INTERVAL * i],
      }))
    ),
    block,
  });

  return marketData.map(
    ({ asset, totalFloatingBorrowAssets, totalFloatingDepositAssets }, i) => ({
      asset,
      fixedPools: fixedPools
        .slice(i * fixedPoolCount, (i + 1) * fixedPoolCount)
        .map(({ borrowed, supplied }) => ({
          borrowed: BigInt(borrowed),
          supplied: BigInt(supplied),
        })),
      totalFloatingBorrowAssets,
      totalFloatingDepositAssets,
    })
  );
};

/** @type {(chain: string) => (timestamp: number, block: number, chainBlocks: Record<string, number>) => Promise<Record<string, bigint>>} */
const tvl =
  (chain) =>
  (timestamp, _, { [chain]: block }) =>
    markets(chain, timestamp, block).then((data) =>
      Object.fromEntries(
        data.map(
          ({
            asset,
            fixedPools,
            totalFloatingBorrowAssets,
            totalFloatingDepositAssets,
          }) => [
            asset,
            fixedPools.reduce(
              (total, { borrowed, supplied }) => total + supplied - borrowed,
              0n
            ) +
              totalFloatingDepositAssets -
              totalFloatingBorrowAssets,
          ]
        )
      )
    );

/** @type {(chain: string) => (timestamp: number, block: number, chainBlocks: Record<string, number>) => Promise<Record<string, bigint>>} */
const borrowed =
  (chain) =>
  (timestamp, _, { [chain]: block }) =>
    markets(chain, timestamp, block).then((data) =>
      Object.fromEntries(
        data.map(({ asset, fixedPools, totalFloatingBorrowAssets }) => [
          asset,
          fixedPools.reduce((total, { borrowed }) => total + borrowed, 0n) +
            totalFloatingBorrowAssets,
        ])
      )
    );

module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
  ...Object.fromEntries(
    Object.entries(chains).map(([chain, { start }]) => [
      chain,
      { start, tvl: tvl(chain), borrowed: borrowed(chain) },
    ])
  ),
};

const abi = new Interface([
  "function asset() view returns (address)",
  "function fixedPools(uint256) view returns ((uint256 borrowed, uint256 supplied, uint256, uint256))",
  "function maxFuturePools() view returns (uint8)",
  "function totalAssets() view returns (uint256)",
  "function totalFloatingBorrowAssets() view returns (uint256)",
]);

/** @typedef {import("@ethersproject/bignumber").BigNumber} BigNumber */
/** @typedef {{ borrowed: bigint, supplied: bigint }} FixedPool */
/**
 * @typedef Market
 * @property {string} asset
 * @property {FixedPool[]} fixedPools
 * @property {bigint} totalFloatingBorrowAssets
 * @property {bigint} totalFloatingDepositAssets
 */
