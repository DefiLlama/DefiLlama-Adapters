const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const EGGS_TOKEN_CONTRACT = "0xf26Ff70573ddc8a90Bd7865AF8d7d70B8Ff019bC";

const abi = [
  {
    type: "function",
    name: "getTotalBorrowed",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
];
async function borrowed(api) {
  const borrowed = await api.call({
    abi: abi[0],
    target: EGGS_TOKEN_CONTRACT,
  });

  api.add("0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38", borrowed);
}

async function tvl(time, ethBlock, _b, { api }) {
  return sumTokens2({ tokens: [nullAddress], owner: EGGS_TOKEN_CONTRACT, api });
}

module.exports = {
  methodology:
    "Calculates the total backing of S in the Eggs contract, and total borrowed in S",
  sonic: {
    tvl,
    borrowed,
  },
};
