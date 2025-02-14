const pools = [
  '0x58008140AE706D915fFcC44F26E919a20f296d9e', // pmUSDT
  '0x28903c58784246ccdDFA12f567457D8844073276', // pmUSDC.e
  '0xECd04602Cac25275ed1B726F7726DC1576B5BCE4', // pmWBTC
  '0x637Aadf4249939A0D2dE51418ec0b2b17b33e86C', // pmWETH
  '0x1e1B776364c60129c1c8e59eF1C003314e3ceE12', // pmARB
  '0xB2a564D9Bb08C5366BF26384bd372e6F4f3372c8', // pmFRAX
  '0x85A39cE6339D96786D8c99CD098d351C5b29C210' // pmDAI
]

const abi = {
  "asset": "address:asset",
  "totalAssets": "uint256:totalAssets"
}

async function tvl(api) {
  const tokens = await api.multiCall({ abi: abi.asset, calls: pools, permitFailure: true, })
  const bals = await api.multiCall({ abi: abi.totalAssets, calls: pools, permitFailure: true, })
  tokens.forEach((v, i) => {
    if (v && bals[i]) api.add(v, bals[i])
  })
  return api.getBalances()
}

module.exports = {
  methodology:
    "TVL displays the total amount of assets stored in the Promethium contracts, excluding not claimed fees.",
  start: '2023-10-01',
  arbitrum: { tvl },
  hallmarks: [[1696164866, "Profitable pools deployment"]],
};
