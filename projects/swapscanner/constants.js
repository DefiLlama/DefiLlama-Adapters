const RPC_ENDPOINT_URL = "https://public-node-api.klaytnapi.com/v1/cypress";
const SCNR = {
  decimals: 25,
  address: "0x8888888888885b073f3c81258c27e83db228d5f3",
  staking: "0x7c59930D1613CA2813e5793dA72B324712F6899D",
  lp: {
    KLAY: "0xe1783a85616ad7dbd2b326255d38c568c77ffa26",
  },
};

const ABIs = {
  LP: [
    {
      inputs: [],
      name: "getReserves",
      outputs: [
        { internalType: "uint112", name: "_reserve0", type: "uint112" },
        { internalType: "uint112", name: "_reserve1", type: "uint112" },
        { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
      ],
      type: "function",
    },
  ],
  Staking: [
    {
      inputs: [{ name: "", type: "address" }],
      name: "totalStakedBalanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      type: "function",
    },
  ],
};

module.exports = {
  RPC_ENDPOINT_URL,
  SCNR,
  ABIs,
};
