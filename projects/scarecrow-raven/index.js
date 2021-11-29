const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addTokensAndLPs } = require("../helper/unwrapLPs");
const erc20 = require("../helper/abis/erc20.json");

const chef = "0x2639779d6ca9091483a2a7b9a1fe77ab83b90281"

async function chainTvl(timestamp, block, chainBlocks) {
  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: chef,
        chain: "fantom",
        block: chainBlocks["fantom"],
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
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output.map((lp) => ({ output: lp.output[0].toLowerCase() }));

  const amounts = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpTokens.map((lp) => ({
        target: lp.output,
        params: chef,
      })),
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  )

  const balances = {};
  const tokens = { output: lpTokens };
  const transformAddress = await transformFantomAddress();
  await addTokensAndLPs(
    balances,
    tokens,
    amounts,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  tvl: sdk.util.sumChainTvls([chainTvl]),
}