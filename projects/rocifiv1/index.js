const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDC = ADDRESSES.polygon.USDC;
const WETH = ADDRESSES.polygon.WETH_1

const ROCI_POOLS = [
  '0x883F10Dc3960493f38F69b8696dC331D22fdEd76',
  '0x8bf2B880B48EA3d1b13677f327c5058480b4e1d0',
  '0x978F89dE413594378a68CB9C14a83CeC0cEC721b'
];

const ROCI_REVENUE_MANAGER = "0x10C9F64289cc5114E8854Cc216aD75a0d19d60b5";
const ROCI_COLLATERAL_MANAGER = "0x6cb3C5e73b9A6B9E5e9745545a0f40c9724e2337";

const RociRevenueManagerABI = 'function balanceAvailable(address _poolAddress) view returns (uint256)'
const poolValueAbi = "uint256:poolValue"


async function tvl(api) {
  return sumTokens2({
    api, tokensAndOwners: [
      [WETH, ROCI_COLLATERAL_MANAGER],
      [USDC, ROCI_REVENUE_MANAGER],
    ]
  })
}

async function borrowed(api) {
  const poolValues = await api.multiCall({
    abi: poolValueAbi,
    calls: ROCI_POOLS,
  })
  const balanceAvailable = await api.multiCall({
    target: ROCI_REVENUE_MANAGER,
    abi: RociRevenueManagerABI,
    calls: ROCI_POOLS,
  })
  let total = 0
  poolValues.forEach(output => total += +output)
  balanceAvailable.forEach(output => total -= +output)
  if (total < 0) total = 0
  return {
    ['polygon:'+USDC]: total / 1e6
  }
}

module.exports = {
  polygon: {
    tvl,
    borrowed,
  },
};