// https://www.starknetjs.com/docs/API/#contract
const { call, multiCall, parseAddress } = require("../helper/chain/starknet");
const abi = require("./abi");
const { transformDexBalances } = require("../helper/portedTokens");

const factory =
  "0x02721f5ab785ae5E13b276ca9d41e859B7b150440A288A7826Ba5E27Dd05E08e";

async function tvl() {
  const { 1: all_pairs } = await call({
    target: factory,
    abi: abi.factory.all_pairs,
  });
  const calls = all_pairs.map((i) => parseAddress(i))
  const snapshots = await multiCall({ abi: abi.pair.snapshot, allAbi: abi.pabistructs, calls, });

  const data = snapshots.map(snapshot => {
    const { token0, token1, reserve0, reserve1 } = snapshot;
    return {
      token0: parseAddress(token0),
      token1: parseAddress(token1),
      token0Bal: reserve0.toString(),
      token1Bal: reserve1.toString(),
    }
  });

  return transformDexBalances({ chain: "starknet", data });
}

module.exports = {
  timetravel: false,
  methodology: "Value of all LP available in the DEX",
  isHeavyProtocol: true,
  starknet: {
    tvl,
  },
};
