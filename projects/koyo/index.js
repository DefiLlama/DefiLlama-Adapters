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

module.exports = chainExports(chainTVL, ["boba"]);

module.exports = {
  ...module.exports,
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  start: 587_102,
};
