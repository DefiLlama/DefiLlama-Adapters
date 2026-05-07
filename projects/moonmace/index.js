const ADDRESS = "0x7a2e4188744696cd7388AD07a7a718e33bd97c89";

async function tvl(api) {
  const totalStaked = await api.call({
    target: ADDRESS,
    abi: "function totalStakingAmount() view returns (uint256)", 
  });
  api.addGasToken(totalStaked);
}

module.exports = {
  monad: {
    tvl,
  },
}
