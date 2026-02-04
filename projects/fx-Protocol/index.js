const ADDRESSES = require('../helper/coreAssets.json')
const treasuries = [
  "0x0e5CAA5c889Bdf053c9A76395f62267E653AFbb0",
  "0xED803540037B0ae069c93420F89Cd653B6e3Df1f",
  "0xcfEEfF214b256063110d3236ea12Db49d2dF2359",
  "0x781BA968d5cc0b40EB592D5c8a9a3A4000063885",
  "0x38965311507D4E54973F81475a149c09376e241e",
  "0x63Fe55B3fe3f74B42840788cFbe6229869590f83",
  "0xdFac83173A96b06C5D6176638124d028269cfCd2"
]
const uniBTC = "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568";
const uniBTC_Genesis_Gauge = "0x1D20671A21112E85b03B00F94Fd760DE0Bef37Ba"
const fxUSD_stabilityPool = "0x65C9A641afCEB9C0E6034e558A319488FA0FA3be"
const FxProtocol_PoolManager = "0x250893CA4Ba5d05626C785e8da758026928FCD24"
const FxProtocol_PoolManager_AaveV3Strategy = "0xFd3A6540e21D0E285f88FBFd904883B23e08F5C8"
const FxProtocol_PoolManager_AaveV3Strategy_USDC = "0x376aa9086060740f444c4E7A5411ff235816Aa0C"
module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
    pool2: getGaugeTvl,
  },
};

async function getGaugeTvl(api) {
  const gauges = await api.fetchList({ lengthAbi: 'n_gauges', itemAbi: 'gauges', target: '0xe60eB8098B34eD775ac44B1ddE864e098C6d7f37' })

  const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: gauges, permitFailure: true })
  const bals = await api.multiCall({ abi: 'uint256:totalSupply', calls: gauges, permitFailure: true })
  tokens.forEach((token, i) => {
    if (token && bals[i])
      api.add(token, bals[i])
  })
}

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:baseToken', calls: treasuries })
  const tokensAndOwners = [
    [uniBTC, uniBTC_Genesis_Gauge],
    [ADDRESSES.ethereum.USDC, fxUSD_stabilityPool],
    [ADDRESSES.ethereum.WSTETH, FxProtocol_PoolManager],
    [ADDRESSES.ethereum.WBTC, FxProtocol_PoolManager],
    ["0xc035a7cf15375ce2706766804551791ad035e0c2", FxProtocol_PoolManager_AaveV3Strategy],
    ["0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", FxProtocol_PoolManager_AaveV3Strategy_USDC],
  ]
  tokens.forEach((v, i) => tokensAndOwners.push([v, treasuries[i]]))
  return api.sumTokens({ tokensAndOwners })
}