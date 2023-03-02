const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");

const vault = "0x992EB7040b66b13abEa94E2621D4E61d5CE608BD";
const usdc = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

async function tvl(_, _1, _2, { api }) {
  const transformAddress = await getChainTransform(api.chain);

  // decimals: 6
  const collateralBalance = await api.call({
    abi: "uint256:tvl",
    target: vault,
  });

  const balances = {};

  await sdk.util.sumSingleBalance(
    balances,
    transformAddress(usdc),
    collateralBalance
  );

  return balances;
}

module.exports = {
  arbitrum: {
    tvl,
  },
  hallmarks: [
    [1641556800, "MMT Launch"],
    [1676988000, "IDO on sushiswap"],
    [1677765600, "Closed mainnet"],
  ],
};
