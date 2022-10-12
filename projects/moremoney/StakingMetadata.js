const { ethers } = require("ethers");
const addresses = require("./addresses.json");
const VestingStakingRewards = require("./VestingStakingRewards.json");

async function useParsedStakingMetadata() {
  const curAddresses = addresses["43114"];

  const provider = getProvider("avax");

  const stratViewer = new ethers.Contract(
    curAddresses.CurvePoolRewards,
    VestingStakingRewards.abi,
    provider
  );

  const normalResults = await stratViewer.stakingMetadata(
    ethers.constants.AddressZero
  );
  return [normalResults];
}

module.exports = {
  useParsedStakingMetadata: useParsedStakingMetadata,
};
