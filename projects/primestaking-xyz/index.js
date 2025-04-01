const xdcStakeRewardTokenAddress = '0x7f115F68A789F819047b94EFA0114AA9829b83d8'

const tvl = async (api) => {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: xdcStakeRewardTokenAddress, })
  api.addGasToken(totalSupply)
}

module.exports = {
  xdc: { tvl }
}