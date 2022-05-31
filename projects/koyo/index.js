const constants = require("./constants");
const utils = require("../helper/utils");
const { chainJoinExports, chainTypeExports } = require("./utils");
const { getBlock } = require("../helper/getBlock");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformBobaAddress } = require("../helper/portedTokens");

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
          addresss: [constants.addresses.boba.treasury],
          tokens: [
            [constants.addresses.boba.BOBA, false], // BOBA(Boba)
            [constants.addresses.boba.FRAX, false], // FRAX(Boba)
            [constants.addresses.boba.FRAX_KYO, true], // FRAX-KYO(Boba, OolongSwap)
          ],
        },
        staking: {
          address: constants.addresses.boba.staking,
          token: constants.addresses.boba.KYO,
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
