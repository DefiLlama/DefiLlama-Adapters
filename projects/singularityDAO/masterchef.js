const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

async function addFundsInMasterChef({
  balances,
  block,
  masterchef,
  skipTokens = [],
  chain,
}) {
  const poolLength = (
    await sdk.api.abi.call({
      target: masterchef,
      abi: abi.poolLength,
      block,
      chain,
    })
  ).output;
  const calls = Array.from(Array(+poolLength).keys()).map((i) => ({
    params: i,
  }));
  const response = (
    await sdk.api.abi.multiCall({
      target: masterchef,
      calls,
      abi: abi.lpToken,
      block,
      chain,
    })
  ).output;
  const transform = await transformBscAddress();
  const tokensAndOwners = response
    .map((r) => [r.output, masterchef])
    .filter(([token]) => !skipTokens.includes(token));

  return chain === "bsc"
    ? sumTokens(balances, tokensAndOwners, block, chain, transform, {
        resolveLP: true,
      })
    : sumTokens(balances, tokensAndOwners, block, undefined, undefined, {
        resolveLP: true,
      });
}

module.exports = {
  addFundsInMasterChef,
};
