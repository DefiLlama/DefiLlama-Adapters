const iVaultAddresses = [
  '0x72Cf258c852Dc485a853370171d46B9D29fD3184', //iUSDT
  '0x3E3db9cc5b540d2794DB3861BE5A4887cF77E48B', //iYCRV
  '0x1e0DC67aEa5aA74718822590294230162B5f2064', //iDAI
  '0x4243f5C8683089b65a9F588B1AE578d5D84bFBC9', //iTUSD
  '0x23B4dB3a435517fd5f2661a9c5a16f78311201c1', //iUSDC
  '0xa8EA49a9e242fFfBdECc4583551c3BcB111456E6', //iETH
  '0xc46d2fC00554f1f874F37e6e3E828A0AdFEFfbcB', //iBUSD
  '0x26AEdD2205FF8a87AEF2eC9691d77Ce3f40CE6E9', //iHBTC
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:token', calls: iVaultAddresses })
  const bals = await api.multiCall({ abi: 'uint256:balance', calls: iVaultAddresses })
  api.add(tokens, bals)
}

module.exports = {
  doublecounted: true,
  start: '2020-09-15',    // 09/16/2020 @ 12:00am (UTC+8)
  ethereum: { tvl }
}