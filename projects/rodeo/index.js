const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const addressInvestorHelper = "0x6f456005A7CfBF0228Ca98358f60E6AE1d347E18"
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
const allPools = [
  {
    asset: USDC,
    address: "0x0032F5E1520a66C6E572e96A11fBF54aea26f9bE",
    slug: "usdc-v1",
  },
];

const getPoolInfos = async (chain) => {
  const yieldPools = allPools.map((pool) => {
    return {...pool};
  });

  const peekPools = (
    await sdk.api.abi.multiCall({
      target: addressInvestorHelper,
      chain,
      abi: abi.peekPools,
      calls: yieldPools.map((pool) => ({
        params: [[pool.address]],
      })),
    })
  ).output;

  return yieldPools.map((pool, i) => {
    const values = peekPools[i].output;
    return {
      share: values[1][0],
      supply: values[2][0],
      borrow: values[3][0],
      rate: values[4][0],
      price: values[5][0],
    }
  });
}

function calculateTvl(amount, price) {
  const tvl = parseFloat(amount) * price;
  return tvl;
}

const tvl = async () => {
  const balances = {}
  const poolsBalances = await getPoolInfos('arbitrum');
  const tvl = poolsBalances.reduce((acc, { supply, price }) => {
    acc = acc + calculateTvl(supply, price);
    return acc
  }, 0);
  sdk.util.sumSingleBalance(balances, "arbitrum:" + USDC, tvl);
  return balances;
}

module.exports = {
  arbitrum: {
    tvl
  },
  methodology: `The result is calculated by subtracting borrow tvl from supply tvl`
};
