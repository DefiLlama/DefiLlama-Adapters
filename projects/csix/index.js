const CSIX_TOKEN = "0x04756126F044634C9a0f0E985e60c88a51ACC206";
const STAKING_CONTRACT_V1 = "0xadc743298F6339Cd8ebC0Dc58D4E19C2065D6b4f";
const STAKING_CONTRACT_V2 = "0xA4f55D251b8fa8e0C291CC539F020c5Cbe4a9FA8";
const STAKING_CONTRACT_V3 = "0x7c7C76e4D47872A7B73FA15306A9Ebb673796dDc";

async function staking(api) {
  const staked = await api.multiCall({
    abi: "uint256:totalStaked",
    calls: [STAKING_CONTRACT_V1, STAKING_CONTRACT_V2, STAKING_CONTRACT_V3],
  });
  staked.forEach((i) => api.add(CSIX_TOKEN, i));
  return api.getBalances();
}

module.exports = {
  hallmarks: [
    [1676338485, "Staking V1"],
    [1700652398, "Staking V2"],
    [1708909450, "Staking V3"],
  ],
  bsc: {
    tvl: () => ({}),
    staking,
  },
  start: 25647232,
  methodology: "Counts as TVL the CSIX deposited through Staking Contract",
};
