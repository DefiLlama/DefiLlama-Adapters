/*** This Protocol seems hacked/rugged. It's a case for study and analyze ***/

const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const factoryContract = "0xa22F8cf50D9827Daef24dCb5BAC92C147a9D342e";

const ethTvl = async (timestamp, block) => {
  const balances = {};

  const lengthOfPools = (
    await sdk.api.abi.call({
      abi: abi.allPoolsLength,
      target: factoryContract,
      block,
    })
  ).output;

  for (let i = 0; i < lengthOfPools; i++) {
    const pool = (
      await sdk.api.abi.call({
        abi: abi.allPools,
        target: factoryContract,
        params: i,
        block,
      })
    ).output;

    const token = (
      await sdk.api.abi.call({
        abi: abi.token,
        target: pool,
        block,
      })
    ).output;

    const reserve = (
      await sdk.api.abi.call({
        abi: abi.reserve,
        target: pool,
        block,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, token, reserve);
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "Counts tvl on all the Pools through Factory Contract",
};
