const { transformBobaAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");
const utils = require("../helper/utils");

const DATA = {
  boba: async () => {
    const bobaTransform = transformBobaAddress();
    const pools = await utils.fetchURL(
      "https://api.exchange.koyo.finance/pools/raw/boba"
    );

    return [
      bobaTransform,
      {
        treasury: {
          addresss: ["0x559dBda9Eb1E02c0235E245D9B175eb8DcC08398"],
          tokens: [
            ["0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7", false], // BOBA(Boba)
          ],
        },
        swaps: Object.entries(pools.data.data)
          .filter(([k]) => k !== "generatedTime")
          .map(([, pool]) => ({
            address: pool.addresses.swap,
            tokens: pool.coins.map((coin) => coin.address),
          })),
      },
    ];
  },
};

const chainTypeExports = (chainType, chainFn, chains) => {
  const chainTypeProps = chains.reduce(
    (obj, chain) => ({
      ...obj,
      [chain === "avax" ? "avalanche" : chain]: {
        [chainType]: chainFn(chain),
      },
    }),
    {}
  );

  return chainTypeProps;
};

const chainTVL = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);

    const [transform, data] = await DATA[chain]();

    await sumTokensAndLPsSharedOwners(
      balances,
      [...new Set(data.swaps.flatMap((swap) => swap.tokens)).values()].map((token) => [token, false]),
      data.swaps.map((swap) => swap.address),
      block,
      chain,
      transform
    );

    return balances;
  };
};

const chainTreasury = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);

    const [transform, data] = await DATA[chain]();

    await sumTokensAndLPsSharedOwners(
      balances,
      data.treasury.tokens,
      data.treasury.addresss,
      block,
      chain,
      transform
    );

    return balances;
  };
};

const chainJoinExports = (cExports, chains) => {
  const createdCExports = cExports.map((cExport) => cExport(chains));
  const chainJoins = chains.reduce((obj, chain) => {
    chain = chain === "avax" ? "avalanche" : chain;

    return {
      ...obj,
      [chain]: Object.fromEntries(
        createdCExports.flatMap((cExport) => [
          ...Object.entries(cExport[chain]),
        ])
      ),
    };
  }, {});

  return chainJoins;
};

module.exports = chainJoinExports(
  [
    (chains) => chainTypeExports("tvl", chainTVL, chains),
    (chains) => chainTypeExports("treasury", chainTreasury, chains),
  ],
  ["boba"]
);

module.exports = {
  ...module.exports,
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  start: 587_102,
};
