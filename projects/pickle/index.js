const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { unwrapUniswapLPs, unwrapCrv } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const { chainExports } = require("../helper/exports");

const excluded = ["pbamm", "pickle-eth", "sushi-pickle-eth"]
const jars_url =
  "https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod/protocol/pools";

function chainTvl(chain){
  return async (timestamp, _ethBlock, chainBlocks) => {
  const block = chainBlocks[chain]
  const transformAddress = await getChainTransform(chain)
  const balances = {};

  let jars = (await utils.fetchURL(jars_url)).data
    .map(jar => {
      if (jar.network === (chain==="ethereum"?'eth':chain))
        return {
          jarAddress: jar.jarAddress,
          tokenAddress: jar.tokenAddress,
          name: jar.identifier
        };
    })
    .filter(x => x && !excluded.includes(x.name));
  

  const jar_balances = (
    await sdk.api.abi.multiCall({
      block,
      calls: jars.map(jar => ({
        target: jar.jarAddress
      })),
      abi: abi.balance,
      chain
    })
  ).output.map(val => val.output);

  const lpPositions = [];

  await Promise.all(
    jars.map(async (jar, idx) => {
      if (jar.name.toLowerCase().includes("crv") && jar.name != "yvecrv-eth") {
        await unwrapCrv(
          balances,
          jar.tokenAddress,
          jar_balances[idx],
          block,
          chain,
          transformAddress
        );
      } else if (jar.name.includes("-") || jar.name.includes("lp")) {
        lpPositions.push({
          balance: jar_balances[idx],
          token: jar.tokenAddress
        });
      } else if(jar.name==="aleth") {
        sdk.util.sumSingleBalance( // sum as weth
          balances,
          "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          jar_balances[idx]
        );
      } else {
        sdk.util.sumSingleBalance(
          balances,
          transformAddress(jar.tokenAddress),
          jar_balances[idx]
        );
      }
    })
  );
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    transformAddress
  );

  return balances;
}
}

module.exports = chainExports(chainTvl, ["polygon", "ethereum", "arbitrum"])
