const sdk = require("@defillama/sdk");
const ethers = require("ethers");

const CSIX_TOKEN = "0x04756126F044634C9a0f0E985e60c88a51ACC206";
const STAKING_CONTRACT_V1 = "0xadc743298F6339Cd8ebC0Dc58D4E19C2065D6b4f";
const STAKING_CONTRACT_V2 = "0xA4f55D251b8fa8e0C291CC539F020c5Cbe4a9FA8";

const ABI = {
  inputs: [],
  name: "totalStaked",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};

async function staking(_, _1, _2, { api }) {
  const totalStakes = await api.batchCall([
    {
      abi: ABI,
      target: STAKING_CONTRACT_V1,
    },
    {
      abi: ABI,
      target: STAKING_CONTRACT_V2,
    },
  ]);

  const totalStaked = totalStakes.reduce(
    (prev, curr) => prev.add(curr),
    ethers.BigNumber.from(0)
  );

  api.add(CSIX_TOKEN, totalStaked);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  bsc: {
    tvl: staking,
    staking,
  },
  start: 25647232,
  methodology: "Counts as TVL the CSIX deposited through Staking Contract",
};
