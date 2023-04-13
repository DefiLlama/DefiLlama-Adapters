const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { utils: { parseUnits }} = require("ethers");

const investorHelper = "0x6f456005A7CfBF0228Ca98358f60E6AE1d347E18";
const pools = [
  {
    address: "0x0032F5E1520a66C6E572e96A11fBF54aea26f9bE",
    slug: "usdc-v1",
    asset: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  },
];

const tvl = async () => {
  const { output } = await sdk.api.abi.call({
    chain: "arbitrum",
    target: investorHelper,
    abi: abi.peekPools,
    params: [pools.concat(pools).map((p) => p.address)],
  });
  return pools.reduce((balances, pool, i) => {
    const supply = parseUnits(output[2][i], 0);
    const borrow = parseUnits(output[3][i], 0);
    balances["arbitrum:" + pool.asset] = supply.sub(borrow).toString();
    return balances;
    }, {});
}

module.exports = {
  arbitrum: { tvl },
  methodology: `The TVL shown is the result of subtracting the borrow from the supply for each Rodeo lending pool`,
};
