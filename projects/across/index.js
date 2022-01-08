const sdk = require("@defillama/sdk");
const { requery } = require("../helper/requery");

const abi = {
  inputs: [],
  name: "l1Token",
  outputs: [
    {
      internalType: "contract IERC20",
      name: "",
      type: "address",
    },
  ],
  stateMutability: "view",
  type: "function",
};

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
    abi: abi,
  });
  await requery(collaterals, "ethereum", block, abi);
  const poolCollaterals = collaterals.output
    .filter((t) => t.output !== null)
    .map((c) => [c.output, c.input.target])
  await Promise.all(poolCollaterals.map(async poolCollateral=>{
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