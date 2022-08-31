const sdk = require("@defillama/sdk");
const { requery } = require("../helper/requery");
const abi = require("./abi");

const hubPoolAddress = "0xc186fA914353c44b2E33eBE05f21846F1048bEda"

// Captures TVL for Across liquidity pools on L1
async function across(timestamp, block) {
  const balances = {};
  const logs = await sdk.api.util.getLogs({
    target: "0x30B44C676A05F1264d1dE9cC31dB5F2A945186b6",
    topic: "WhitelistToken(uint256,address,address,address)",
    keys: ["topics"],
    fromBlock: 13544988,
    toBlock: block,
  });
  const v2Logs = await sdk.api.util.getLogs({
    target: hubPoolAddress,
    topic: "LiquidityAdded(address,uint256,uint256,address)",
    keys: ["topics"],
    fromBlock: 14819537,
    toBlock: block,
  });

  const v2CollateralAddresses = v2Logs.output.map(function (collateral) {
    return collateral[1];
  });

  const uniqueV2Collateral = [
    ...new Set(v2CollateralAddresses.map((a) => JSON.stringify('0x' + a.slice(26)))),
  ].map((a) => JSON.parse(a));

  const v2LpTokens = await sdk.api.abi.multiCall({
    calls: uniqueV2Collateral.map((poolLog) => ({
      target: hubPoolAddress,
      params: poolLog
    })),
    block,
    abi: abi.pooledTokens,
  });

  const v2pools = v2LpTokens.output
  .filter((t) => t.output !== null)
  .map((c) => [c.input.params[0], c.output.lpToken])

  const bridgePoolAddresses = logs.output.map(function (bridgePool) {
    return bridgePool[3];
  });
  const uniquePools = [
    ...new Set(bridgePoolAddresses.map((a) => JSON.stringify(a))),
  ].map((a) => JSON.parse(a));
  const collaterals = await sdk.api.abi.multiCall({
    calls: uniquePools.map((poolLog) => ({
      target: `0x${poolLog.slice(26)}`,
    })),
    block,
    abi: abi.l1Token,
  });
  await requery(collaterals, "ethereum", block, abi);
  const poolCollaterals = collaterals.output
    .filter((t) => t.output !== null)
    .map((c) => [c.output, c.input.target])

  const mergePools = [...poolCollaterals, ...v2pools]
  await Promise.all(mergePools.map(async poolCollateral=>{
    const poolSupply = await sdk.api.erc20.totalSupply({
      target: poolCollateral[1],
      block
    })
    sdk.util.sumSingleBalance(
      balances,
      poolCollateral[0],
      poolSupply.output
    );
  }))
  return balances;
}

module.exports = {
  ethereum: {
    tvl: across,
  }
};