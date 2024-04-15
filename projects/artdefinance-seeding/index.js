const ADFSeedingContract = "0x2f6f2DBF7d7Cc69e676b3647543fC8E1e3D9Dd6f"
const ADF = "0x6bd10299f4f1d31b3489dc369ea958712d27c81b"

async function staking(api) {
  const round = await api.call({ abi: 'uint256:currentRound', target: ADFSeedingContract })
  const data = await api.call({ abi: "function getRoundInfo (uint256 round) public view returns (tuple(bool _roundStatus , uint256 _tierCount , uint256 _roundStartTime , uint256 _roundEndTime , uint256 _totalSeeding , uint256 _roundReward , uint256 _claimReward))", target: ADFSeedingContract, params: round })
  api.add(ADF, data._totalSeeding)
  return api.getBalances()
}

module.exports = {
  methodology:
    "Total Value Staked on Seeding function of Artiside, powered by Art de Finance, is calculated by the sum of $ADF staked in the artist pool.",
  polygon: {
    tvl: () => ({}), staking,
  }
}

