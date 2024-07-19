const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const listTokens = require("./listTokens.json");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { getChainTransform } = require('../helper/portedTokens')

const L1LiquidityPool = "0x1A26ef6575B7BBB864d984D9255C069F6c361a14";
const L1StakingTokens = [
  "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07", // OMG
  "0x42bbfa2e77757c645eeaad1655e0911a7553efbc", // BOBA
];

const L2LiquidityPool = "0x3A92cA39476fF84Dc579C868D4D7dE125513B034";
const L2StakingTokens = [
  ADDRESSES.boba.OMG, //OMG on boba
  ADDRESSES.boba.BOBA, //BOBA on boba
];

const calcTvl = async (
  balances,
  liquidityPool,
  excludedTokens,
  chain = "ethereum",
  block,
) => {
  const transform = await getChainTransform(chain)

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
  const calls = (chain == "ethereum" ? tokensL1 : tokensL2)
    .filter(t  => !excludedTokens.some((addr) => addr.toLowerCase() === t.toLowerCase()))
    .map(t => ({ params: t}))
  const { output } = await sdk.api.abi.multiCall({
    target: liquidityPool,
    abi: abi.poolInfo,
    calls,
    chain, block: block,
  })

  output.forEach(({ input, output: { userDepositAmount }}) => {
    sdk.util.sumSingleBalance(balances, transform(input.params[0]), userDepositAmount)
  })
};

const ethTvl_L1 = async (_, _b, { ethereum: block }) => {
  const balances = {};
  await calcTvl(balances, L1LiquidityPool, L1StakingTokens, 'ethereum', block);
  return balances;
};

const bobaTvl_L2 = async (_, _b, { boba: block }) => {
  const balances = {};
  await calcTvl(balances, L2LiquidityPool, L2StakingTokens, "boba", block);
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
      staking(L2LiquidityPool, L2StakingTokens[0]),
      staking(L2LiquidityPool, L2StakingTokens[1], "boba", L1StakingTokens[1]),
    ]),
    tvl: bobaTvl_L2,
  },
  methodology:
    "Counts liquidity of all the Assets deposited through LiquidtyPool Contracts",
};
