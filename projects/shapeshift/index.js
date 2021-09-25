const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

// Contracts
const StakingYieldContract = "0xDd80E21669A664Bce83E3AD9a0d74f8Dad5D9E72";

// Tokens Or LPs
const ETH_FOX_UNIV2 = "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c";
const FOX = "0xc770eefad204b5180df6a14ee197d99d808ee52d";

const calcTvl = async (tokenOrLp, bool) => {
  const balances = {};
  let chainBlocks = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [[tokenOrLp, bool]],
    [StakingYieldContract],
    chainBlocks["ethereum"],
    "ethereum",
    (addr) => addr
  );

  return balances;
};

/*** Staking of native token (FOX) TVL portion ***/
const staking = async () => {
  return calcTvl(FOX, false);
};

const ethTvl = async () => {
  return calcTvl(ETH_FOX_UNIV2, true);
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "We count liquidity of ETH-FOX LP deposited on Uniswap V2 pool threw StakingYieldContract contract; and the staking of native token",
};
