const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
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
  await sumTokens(
    balances,
    collaterals.output
      .filter((t) => t.output !== null)
      .map((c) => [c.output, c.input.target]),
    block
  );
  return balances;
}

module.exports = {
  ethereum: {
    tvl: across,
  }
};