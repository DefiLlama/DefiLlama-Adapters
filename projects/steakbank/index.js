const stakingContract = "0x79DB0dAa012F4b98F332A9D45c80A1A3FFaa6f9a"

async function tvl(api){
  const staked = await api.call({  abi: "uint256:lbnbMarketCapacityCountByBNB", target: stakingContract})
  api.addGasToken(staked)
}

module.exports = {
  bsc:{
    tvl,
  },
}