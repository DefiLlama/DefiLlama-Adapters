const xdcStakeRewardTokenAddress = '0xDc74c0DaED82ae94486DeeF22991d2F54173c734'

const tvl = async (api) => {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: xdcStakeRewardTokenAddress, })
  api.addGasToken(totalSupply)
}

module.exports = {
  xdc: { tvl }
}
