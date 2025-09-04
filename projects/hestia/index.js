const sdk = require("@defillama/sdk");

const vault = "0xC10aA720dFde56be6fB37F91189a64215a61ddc3";
const hestiaToken = "0xBC7755a153E852CF76cCCDdb4C2e7c368f6259D8";
const pHestiaToken = "0xF760fD8fEB1F5E3bf3651E2E4f227285a82470Ff";

const abi = [
  // getState() returns pHestia balance
  {
    inputs: [],
    name: "getState",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "pHestiaBalance", type: "uint256" },
        ],
        internalType: "struct HestiaMine.State",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // convertPtknToTkn(uint256) returns Hestia amount from pHestia
  {
    inputs: [{ internalType: "uint256", name: "ptknAmount", type: "uint256" }],
    name: "convertPtknToTkn",
    outputs: [{ internalType: "uint256", name: "tknAmount", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

module.exports = {
  base: {
    tvl: async () => {
      // 1️⃣ Get pHestia balance from vault
      const state = await sdk.api.abi.call({
        target: vault,
        abi: abi[0],
        chain: "base",
      });

      const pHestiaBalance =
        state.output?.pHestiaBalance?.toString() ||
        state.output?.[0]?.pHestiaBalance?.toString() ||
        "0";

      // 2️⃣ Convert pHestia to Hestia
      const converted = await sdk.api.abi.call({
        target: vault,
        abi: abi[1],
        params: [pHestiaBalance],
        chain: "base",
      });

      const hestiaAmount = converted.output?.toString() || "0";

      // 3️⃣ Return TVL in Hestia
      return {
        [hestiaToken]: hestiaAmount,
      };
    },
  },
};
