const sdk = require("@defillama/sdk");
const listTokens = require("./listTokens.json");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");

const L1LiquidityPool = "0x1A26ef6575B7BBB864d984D9255C069F6c361a14";
const L1StakingTokens = [
  "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07", // OMG
  "0x42bbfa2e77757c645eeaad1655e0911a7553efbc", // BOBA
];

const L2LiquidityPool = "0x3A92cA39476fF84Dc579C868D4D7dE125513B034";
const L2StakingTokens = [
  "0xe1E2ec9a85C607092668789581251115bCBD20de", //OMG on boba
  "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7", //BOBA on boba
];

const calcTvl = async (
  balances,
  liquidityPool,
  excludedTokens,
  chain = "ethereum"
) => {
  let chainBlocks = {};

  const values = listTokens.tokenList.map(Object.values);
  const names = listTokens.tokenList.map(Object.keys);
  const tokensL1 = [];
  const tokensL2 = [];

  for (let i = 0; i < values.length; i++) {
    if (names[i][0].includes("TK_L1")) {
      tokensL1.push(values[i][0]);
    } else {
      tokensL2.push(values[i][0]);
    }
  }

  for (const token of chain == "ethereum" ? tokensL1 : tokensL2) {
    const amountTokenDeposited = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: liquidityPool,
        params: token,
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output.userDepositAmount;

    if (
      excludedTokens.some((addr) => addr.toLowerCase() === token.toLowerCase())
    ) {
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `${chain}:${token}`,
        amountTokenDeposited
      );
    }
  }
};

const ethTvl_L1 = async () => {
  const balances = {};
  await calcTvl(balances, L1LiquidityPool, L1StakingTokens);
  return balances;
};

const bobaTvl_L2 = async () => {
  const balances = {};
  await calcTvl(balances, L2LiquidityPool, L2StakingTokens, "boba");
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: sdk.util.sumChainTvls([
      staking(L1LiquidityPool, L1StakingTokens[0]),
      staking(L1LiquidityPool, L1StakingTokens[1]),
    ]),
    tvl: ethTvl_L1,
  },
  boba: {
    staking: sdk.util.sumChainTvls([
      staking(L2LiquidityPool, L2StakingTokens[0], "boba"),
      staking(L2LiquidityPool, L2StakingTokens[1], "boba", L1StakingTokens[1]),
    ]),
    tvl: bobaTvl_L2,
  },
  methodology:
    "Counts liquidity of all the Assets deposited through LiquidtyPool Contracts",
};
