const { chainExports } = require("../helper/exports");
const { transformBobaAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");

const DATA = {
  boba: () => {
    const bobaTransform = transformBobaAddress();

    return [
      bobaTransform,
      {
        treasury: {
          addresss: ["0x559dBda9Eb1E02c0235E245D9B175eb8DcC08398"],
          tokens: [
            ["0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7", false], // BOBA(Boba)
          ],
        },
        swaps: [
          {
            name: "4pool",
            address: "0x9f0a572be1fcfe96e94c0a730c5f4bc2993fe3f6",
            tokens: [
              "0x7562F525106F5d54E891e005867Bf489B5988CD9", // FRAX(Boba)
              "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35", // DAI(Boba)
              "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc", // USDC(Boba)
              "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d", // USDT(Boba)
            ],
          },
        ],
      },
    ];
  },
};

const chainTreasuryExports = (chainTreasury, chains) => {
  const chainTreasuries = chains.reduce(
    (obj, chain) => ({
      ...obj,
      [chain === "avax" ? "avalanche" : chain]: {
        treasury: chainTreasury(chain),
      },
    }),
    {}
  );

  return chainTreasuries;
};

const chainTVL = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);

    const [transform, data] = DATA[chain]();

    await sumTokensAndLPsSharedOwners(
      balances,
      data.swaps.flatMap((swap) => swap.tokens).map((token) => [token, false]),
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

    const [transform, data] = DATA[chain]();

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
    (chains) => chainExports(chainTVL, chains),
    (chains) => chainTreasuryExports(chainTreasury, chains),
  ],
  ["boba"]
);

module.exports = {
  ...module.exports,
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  start: 587_102,
};
