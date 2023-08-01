const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const ABI = require('./abi.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const boosterAddress = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
const staker = '0x989aeb4d175e16225e39e87d0d97a3360524ad80'
const cvxAddress = ADDRESSES.ethereum.CVX;
const cvxRewardsAddress = "0xCF50b810E57Ac33B91dCF525C6ddd9881B139332";
const crvAddress = ADDRESSES.ethereum.CRV;

const arbiPoolInfoABI = 'function poolInfo(uint256) view returns (address lptoken, address gauge, address rewards, bool shutdown, address factory)'

async function tvl(chain, block) {
  const balances = {}
  let abiPoolInfo = ABI.poolInfo

  if (chain === 'ethereum') {
    //cvxcrv supply
    const { output: crvLocked } = await sdk.api.abi.call({
      target: '0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2', // veCRV
      params: staker,
      abi: 'erc20:balanceOf', block,
    })
    sdk.util.sumSingleBalance(balances, crvAddress, crvLocked)

    //cvxfxs supply
    const { output: fxsLocked } = await sdk.api.abi.call({
      target: '0xc8418af6358ffdda74e09ca9cc3fe03ca6adc5b0', // veFXS
      params: '0x59cfcd384746ec3035299d90782be065e466800b',
      abi: 'erc20:balanceOf', block,
    })
    sdk.util.sumSingleBalance(balances, '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0', fxsLocked)
  } else {
    abiPoolInfo = arbiPoolInfoABI
  }

  let poolInfo = await sdk.api2.abi.fetchList({ chain, block, lengthAbi: ABI.poolLength, itemAbi: abiPoolInfo, target: boosterAddress })
  const { output: gaugeBalances } = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: Array.from(new Set(poolInfo.map(p=>p.gauge))).map(i => ({ target: i, params: staker })),
    chain, block,
  })
  gaugeBalances.forEach(({ output, input }, i) => sdk.util.sumSingleBalance(balances, chain + ':' + poolInfo.find(p=>p.gauge.toLowerCase()===input.target.toLowerCase()).lptoken, output))
  return balances
}

const chains = [
  'ethereum',
  'arbitrum',
  'polygon',
]

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1640164144, "cvxFXS Launched"],
    [1651881600, "UST depeg"]
  ]
};

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => tvl(chain, block)
  }
})

module.exports.ethereum.staking = sumTokensExport({ owner: cvxRewardsAddress, tokens: [cvxAddress] })
