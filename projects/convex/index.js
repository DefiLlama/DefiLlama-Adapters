const ADDRESSES = require('../helper/coreAssets.json')
const ABI = {
    "poolInfo": "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)",
    "poolLength": "uint256:poolLength"
  };const { stakings } = require('../helper/staking');

const boosterAddresses = {
  fraxtal: '0xd3327cb05a8E0095A543D582b5B3Ce3e19270389',
  default: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
};

const staker = '0x989aeb4d175e16225e39e87d0d97a3360524ad80'
const cvxRewardsAddress = "0xCF50b810E57Ac33B91dCF525C6ddd9881B139332";
const cvxLockerAddress = ADDRESSES.ethereum.vlCVX;

const arbiPoolInfoABI = 'function poolInfo(uint256) view returns (address lptoken, address gauge, address rewards, bool shutdown, address factory)'

async function tvl(api) {
  let abiPoolInfo = ABI.poolInfo

  if (api.chain === 'ethereum') {
    //cvxcrv supply
    const crvLocked = await api.call({
      target: '0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2', // veCRV
      params: staker,
      abi: 'erc20:balanceOf',
    })
    api.add(ADDRESSES.ethereum.CRV, crvLocked)

    //cvxfxs supply
    const fxsLocked = await api.call({
      target: '0xc8418af6358ffdda74e09ca9cc3fe03ca6adc5b0', // veFXS
      params: '0x59cfcd384746ec3035299d90782be065e466800b', // Convex Frax vote proxy
      abi: 'erc20:balanceOf',
    })
    api.add(ADDRESSES.ethereum.FXS, fxsLocked)

    //cvxprisma supply
    const [prismaLocked] = await api.call({
      target: '0x3f78544364c3eCcDCe4d9C89a630AEa26122829d', // PRISMA locker
      params: '0x8ad7a9e2B3Cd9214f36Cb871336d8ab34DdFdD5b', // Convex Prisma vote proxy
      abi: 'function getAccountBalances(address) view returns (uint256, uint256)',
    })
    api.add(ADDRESSES.ethereum.PRISMA, prismaLocked * 1e18)

    //cvxfxn supply
    const fxnLocked = await api.call({
      target: '0xEC6B8A3F3605B083F7044C0F31f2cac0caf1d469', // veFXN
      params: '0xd11a4Ee017cA0BECA8FA45fF2abFe9C6267b7881', // Convex F(x) vote proxy
      abi: 'erc20:balanceOf',
    })
    api.add(ADDRESSES.ethereum.FXN, fxnLocked)
  } else {
    if (api.chain === 'fraxtal') {
      //cvxfxs supply on fraxtal
      const fxsLockedFraxtal = await api.call({
        target: '0x007FD070a7E1B0fA1364044a373Ac1339bAD89CF', // veFXS
        params: '0x59CFCD384746ec3035299D90782Be065e466800B', // Convex Frax Fraxtal vote proxy
        abi: 'erc20:balanceOf',
      })
      api.add(ADDRESSES.fraxtal.WFRAX, fxsLockedFraxtal)
    }

    abiPoolInfo = arbiPoolInfoABI
  }

  const poolInfo = await api.fetchList({
    lengthAbi: ABI.poolLength,
    itemAbi: abiPoolInfo,
    target: boosterAddresses[api.chain] ?? boosterAddresses.default,
  })

  const gaugeTokens = Array.from(new Set(poolInfo.map(p => p.gauge.toLowerCase())))
  const gaugeLPMap = {}
  poolInfo.forEach(p => {
    gaugeLPMap[p.gauge.toLowerCase()] = p.lptoken
  })
  const gaugeLPs = gaugeTokens.map(g => gaugeLPMap[g])

  const gaugeBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: gaugeTokens.map(i => ({ target: i, params: staker })),
  })

  api.add(gaugeLPs, gaugeBalances)
}

const chains = [
  'ethereum',
  'arbitrum',
  'polygon',
  'fraxtal',
]

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1640164144, "cvxFXS Launched"],
    [1642374675, "MIM depeg"],
    [1651881600, "UST depeg"],
    [1654822801, "stETH depeg"],
    [1667692800, "FTX collapse"],
    [1690715622, "Curve reentrancy hack"],
    [1695705887, "cvxFXN Launched"],
    [1698409703, "cvxPRISMA Launched"],
  ]
};

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.ethereum.staking = stakings([cvxLockerAddress, cvxRewardsAddress], ADDRESSES.ethereum.CVX)
