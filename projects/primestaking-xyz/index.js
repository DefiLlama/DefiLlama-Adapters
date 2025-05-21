const xdcStakeRewardTokenAddress = '0x9B8e12b0BAC165B86967E771d98B520Ec3F665A6'

const tvl = async (api) => {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: xdcStakeRewardTokenAddress, })
  api.addGasToken(totalSupply)
}

module.exports = {
  xdc: { tvl }
}