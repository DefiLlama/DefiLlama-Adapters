const utils = require("../helper/utils");
const { chainJoinExports, chainTypeExports } = require("./utils");
const { getBlock } = require("../helper/getBlock");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformBobaAddress } = require("../helper/portedTokens");

const BOBA_MAINNET_KYO = "0x618CC6549ddf12de637d46CDDadaFC0C2951131C";
const BOBA_MAINNET_BOBA = "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7";
const BOBA_MAINNET_FRAX = "0x7562F525106F5d54E891e005867Bf489B5988CD9";

const BOBA_MAINNET_FraxKyo = "0xde7C350fA84B7fe792bfAA241303aeF04283c9d2";

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
            [BOBA_MAINNET_BOBA, false], // BOBA(Boba)
            [BOBA_MAINNET_FRAX, false], // FRAX(Boba)
            [BOBA_MAINNET_FraxKyo, true], // FRAX-KYO(Boba, OolongSwap)
          ],
        },
        staking: {
          address: "0x80aa195200f2EC0f3A22f8874515bd97199bB0ec",
          token: BOBA_MAINNET_KYO,
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

const chainTVL = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);

    const [transform, data] = await DATA[chain]();

    await sumTokensAndLPsSharedOwners(
      balances,
      [...new Set(data.swaps.flatMap((swap) => swap.tokens)).values()].map(
        (token) => [token, false]
      ),
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
const chainStaking = (chain) => {
  return async (timestamp, ethBlock, chainBlocks) => {
    const [, data] = await DATA[chain]();

    return staking(data.staking.address, data.staking.token, chain)(
      timestamp,
      ethBlock,
      chainBlocks
    );
  };
};

module.exports = chainJoinExports(
  [
    (chains) => chainTypeExports("tvl", chainTVL, chains),
    (chains) => chainTypeExports("treasury", chainTreasury, chains),
    (chains) => chainTypeExports("staking", chainStaking, chains),
  ],
  ["boba"]
);

module.exports = {
  ...module.exports,
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  start: 587_102,
};
