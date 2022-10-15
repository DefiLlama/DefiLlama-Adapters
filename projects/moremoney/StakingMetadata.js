
const nullAddress = '0x0000000000000000000000000000000000000000'
const sdk = require("@defillama/sdk");
const addresses = require("./addresses.json");

async function useParsedStakingMetadata(block) {
  const curAddresses = addresses.avax;

  const stratViewer = await sdk.api.abi.call({
    block,
    target: curAddresses.CurvePoolRewards,
    abi: {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "stakingMetadata",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "stakingToken",
              type: "address",
            },
            {
              internalType: "address",
              name: "rewardsToken",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "totalSupply",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "tvl",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "aprPer10k",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "vestingCliff",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "periodFinish",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "stakedBalance",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "vestingStart",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "earned",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "rewards",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "vested",
              type: "uint256",
            },
          ],
          internalType: "struct VestingStakingRewards.StakingMetadata",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    chain: "avax",
    params: [nullAddress],
  });

  const normalResults = stratViewer.output;
  return [normalResults];
}

module.exports = {
  useParsedStakingMetadata: useParsedStakingMetadata,
};
