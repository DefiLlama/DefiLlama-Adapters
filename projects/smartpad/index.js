const data = {
  aurora: {
    padTokenAddress: '0x0fAD0ED848A7A16526E8a7574e418B015Dbf41B5',
    stakingContractAddress: '0x3e2F9dE8c59CdCd1fff14963A9c0155410e8Bb07'
  },
  ethereum: {
    padTokenAddress: '0x5067006F830224960Fb419D7f25a3a53e9919BB0',
    stakingContractAddress: '0x105aaB1C3314D61282b4FBF598D07302cf731EF3'
  },
  polygon: {
    padTokenAddress: '0x0Ad2Eff7F37E0037B5E30C1947f31ABdf11461e4',
    stakingContractAddress: '0xa2269805f2Fd714ea0205d44c816cD0ea6f85BdC'
  },
}

async function staking(api) {
  const chainData = data[api.chain]
  return api.sumTokens({ owner: chainData.stakingContractAddress, token: chainData.padTokenAddress })
}

module.exports = {
  methodology: "All tokens locked in Smartpad.",
  ethereum: { staking, tvl: () => ({}) },
  polygon: { staking, tvl: () => ({}) },
  aurora: { staking, tvl: () => ({}) },
}
module.exports.deadFrom = '2022-08-09'

