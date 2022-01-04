const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const { addTokensAndLPs } = require("../helper/unwrapLPs");
const erc20 = require("../helper/abis/erc20.json");

const CHEFS = {
  "avax": "0x5A9710f3f23053573301C2aB5024D0a43A461E80",
  "bsc": "0xD92bc4Afc7775FF052Cdac90352c39Cb6a455900",
  "fantom": "0xC90812E4502D7848E58e53753cA397A201f2e99B"
}

async function chainTvl(timestamp, block, chainBlocks, chain) {
  const chef = CHEFS[chain];
  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: chef,
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output
  );
  const poolIds = Array.from(Array(poolLength).keys());

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.poolInfo,
      calls: poolIds.map((pid) => ({
        target: chef,
        params: pid,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((lp) => ({ output: lp.output[0].toLowerCase() }));

  const amounts = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpTokens.map((lp) => ({
        target: lp.output,
        params: chef,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  )

  const balances = {};
  const tokens = { output: lpTokens };
  const transformAddress = addr => `${chain}:${addr}`;
  await addTokensAndLPs(
    balances,
    tokens,
    amounts,
    chainBlocks[chain],
    chain,
    transformAddress
  );

  return balances;
}

async function avaxTvl(timestamp, block, chainBlocks) {
  return await chainTvl(timestamp, block, chainBlocks, "avax")
}

async function bscTvl(timestamp, block, chainBlocks) {
  return await chainTvl(timestamp, block, chainBlocks, "bsc")
}

async function fantomTvl(timestamp, block, chainBlocks) {
  return await chainTvl(timestamp, block, chainBlocks, "fantom")
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  avalanche: {
    tvl: avaxTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl, bscTvl, fantomTvl]),
}