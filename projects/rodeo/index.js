const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const addressInvestorHelper = "0x6f456005A7CfBF0228Ca98358f60E6AE1d347E18"
const allPools = [
  {
    asset: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    address: "0x0032F5E1520a66C6E572e96A11fBF54aea26f9bE",
    slug: "usdc-v1",
  },
];

const weiDecimals = 1000000000000000000;

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

  const peekPoolInfos = (
    await sdk.api.abi.multiCall({
      target: addressInvestorHelper,
      chain,
      abi: abi.peekPoolInfos,
      calls: yieldPools.map((pool) => ({
        params: [[pool.address]],
      })),
    })
  ).output;

  const getOutput = ({output}) => output.map(({output}) => output);
  const [_, decimals] = await Promise.all(
    ['symbol', 'decimals'].map((method) =>
      sdk.api.abi.multiCall({
        abi: abi[method],
        calls: yieldPools.map((token, i) => ({
          target: peekPoolInfos[i].output[0][0],
        })),
        chain,
      })
    )
  ).then((data) => data.map(getOutput));
  const dTokenDecimals = decimals.map((decimal) =>
    Math.pow(10, Number(decimal))
  );

  return yieldPools.map((pool, i) => {
    const values = peekPools[i].output;
    return {
      share: values[1][0],
      supply: values[2][0],
      borrow: values[3][0],
      rate: values[4][0],
      price: values[5][0],
      decimals: dTokenDecimals[i],
    }
  });
}

function calculateTvl(amount, price, decimals) {
  // amount * underlying price = total pool balance in USD
  const tvl = (parseFloat(amount) / decimals) * (price / weiDecimals);
  return tvl;
}

const tvl = async () => {
  const poolsBalances = await getPoolInfos('arbitrum');
  const balances = poolsBalances.reduce((acc, { supply, price, decimals }) => {
    acc = acc + calculateTvl(supply, price, decimals);
    return acc
  }, 0);
  return balances;
}

module.exports = {
  arbitrum: {
    tvl
  },
  methodology: `The result is calculated by subtracting borrow tvl from supply tvl`
};
