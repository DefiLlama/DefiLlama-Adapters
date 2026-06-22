// https://www.starknetjs.com/docs/API/#contract
const { call, multiCall, parseAddress } = require("../helper/chain/starknet");
const abi = (() => {
const fabis = [
    {
      type: "function",
      name: "all_pairs",
      inputs: [],
      outputs: [
        {
          type: "(core::integer::u32, core::array::Array::<core::starknet::contract_address::ContractAddress>)",
        },
      ],
      state_mutability: "view",
    },
  ];
  
  const pabistructs = [
    {
      type: "struct",
      name: "starkDefi::dex::v1::pair::interface::Snapshot",
      members: [
        {
          name: "token0",
          type: "core::starknet::contract_address::ContractAddress",
        },
        {
          name: "token1",
          type: "core::starknet::contract_address::ContractAddress",
        },
        { name: "decimal0", type: "core::integer::u256" },
        { name: "decimal1", type: "core::integer::u256" },
        { name: "reserve0", type: "core::integer::u256" },
        { name: "reserve1", type: "core::integer::u256" },
        { name: "is_stable", type: "core::bool" },
        { name: "fee_tier", type: "core::integer::u8" },
      ],
    },
  ];
  const pabis = [
    {
      type: "function",
      name: "snapshot",
      inputs: [],
      outputs: [{ type: "starkDefi::dex::v1::pair::interface::Snapshot" }],
      state_mutability: "view",
    },
  ];
  
  const factory = {};
  const pair = {};
  fabis.forEach((i) => (factory[i.name] = i));
  pabis.forEach((i) => (pair[i.name] = i));
return {
    factory,
    pair,
    fabis,
    pabis,
    pabistructs,
  };
})();
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
