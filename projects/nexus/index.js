
async function tvl(api) {
  const MasterProxy = '0x01BFd82675DBCc7762C84019cA518e701C0cD07e'
  // const bytes2 = ethers.utils.formatBytes32String('P1').slice(0, 4) // '0x5031
  const P1Address = await api.call({ abi: 'function getLatestAddress(bytes2) view returns (address)', target: MasterProxy, params: '0x5031' })
  const ethValue = await api.call({  abi: 'uint256:getPoolValueInEth', target: P1Address})
  api.addGasToken(ethValue)
}

module.exports = {
  misrepresentedTokens: true,
  start: '2019-05-23', // 05/23/2019 @ 12:00am (UTC)
  ethereum: { tvl }
}
