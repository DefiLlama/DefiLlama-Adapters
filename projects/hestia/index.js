const sdk = require("@defillama/sdk");

const vault = "0xC10aA720dFde56be6fB37F91189a64215a61ddc3";
const hestiaToken = "0xBC7755a153E852CF76cCCDdb4C2e7c368f6259D8";

const getStateAbi = {
  "inputs": [],
  "name": "getState",
  "outputs": [
    {
      "components": [
        { "internalType": "uint256", "name": "hestiaBalance", "type": "uint256" }
      ],
      "internalType": "struct HestiaMine.State",
      "name": "",
      "type": "tuple"
    }
  ],
  "stateMutability": "view",
  "type": "function"
};

async function tvl() {
  const state = await sdk.api.abi.call({
    target: vault,
    abi: getStateAbi,
    chain: "base"
  });

  // state.output.hestiaBalance is a string
  return { [hestiaToken]: state.output.hestiaBalance };
}

module.exports = {
  base: { tvl }
};
