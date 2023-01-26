const constants = require("../koyo/constants");
const { chainJoinExports, chainTypeExports } = require("../koyo/utils");
const { getBlock } = require("../helper/http");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {
  getChainTransform,
} = require("../helper/portedTokens");

const DATA = {
  boba: async () => {
    const bobaTransform = await getChainTransform('boba');

    return [
      bobaTransform,
      {
        treasury: {
          addresss: [constants.addresses.boba.treasury],
          tokens: [
            [constants.addresses.boba.BOBA, false], // BOBA(Boba)
            [constants.addresses.boba.FRAX, false], // FRAX(Boba)
            [constants.addresses.boba.USDC, false], // USDC(Boba)
            [constants.addresses.boba.USDT, false], // USDT(Boba)
            [constants.addresses.boba.DAI, false], // DAI(Boba)
          ],
        },
        staking: {
          address: constants.addresses.boba.staking,
          token: constants.addresses.boba.KYO,
        },
      },
    ];
  },
  ethereum: async () => {
    const ethereumTransform = await getChainTransform('ethereum');

    return [
      ethereumTransform,
      {
        treasury: {
          addresss: [constants.addresses.ethereum.treasury],
          tokens: [
            [constants.addresses.ethereum.USDC, false], // USDC(Ethereum)
          ],
        },
      },
    ];
  },
};

const chainTreasury = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
    if (!DATA[chain] || constants.treasuryExclusion.includes(chain)) return {};

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
module.exports = chainJoinExports(
  [
    (chains) => chainTypeExports("tvl", chainTreasury, chains),
  ],
  ["boba", "ethereum"]
);
