const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

const factoryContract = "0x71CD6666064C3A1354a3B4dca5fA1E2D3ee7D303";

const ethTvl = async (_, block) => {
  const toa = []

  const pools = (
    await sdk.api.abi.call({
      abi: abi.getAllPools,
      target: factoryContract,
    })
  ).output;
  const calls = pools.map(i => ({ target: i}))
  const { output: res } = await sdk.api.abi.multiCall({
    abi: abi.getTokens,
    calls, block,
  })

  res.forEach(({ output }, i) => output.forEach(t => toa.push([t, pools[i]])))
  return sumTokens2({ tokensAndOwners: toa, block, })
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Counts tvl on all AMM Pools through Factory Contract",
};
