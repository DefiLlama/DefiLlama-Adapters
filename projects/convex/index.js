const sdk = require("@defillama/sdk");
const ABI = require('./abi.json')
const { fetchItemList } = require('../helper/utils')
const { sumTokensExport } = require('../helper/unwrapLPs')

const boosterAddress = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
const staker = '0x989aeb4d175e16225e39e87d0d97a3360524ad80'
const cvxAddress = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";
const cvxRewardsAddress = "0xCF50b810E57Ac33B91dCF525C6ddd9881B139332";
const crvAddress = "0xd533a949740bb3306d119cc777fa900ba034cd52";

const arbiPoolInfoABI = { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "address", "name": "lptoken", "type": "address" }, { "internalType": "address", "name": "gauge", "type": "address" }, { "internalType": "address", "name": "rewards", "type": "address" }, { "internalType": "bool", "name": "shutdown", "type": "bool" }, { "internalType": "address", "name": "factory", "type": "address" }], "stateMutability": "view", "type": "function" }

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

  let poolInfo = await fetchItemList({ chain, block, lengthAbi: ABI.poolLength, itemAbi: abiPoolInfo, target: boosterAddress })
  poolInfo = poolInfo.map(i => i.output);
  const { output: gaugeBalances } = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: poolInfo.map(i => ({ target: i.gauge, params: staker })),
    chain, block,
  })
  gaugeBalances.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances, chain + ':' + poolInfo[i].lptoken, output))
  return balances
}

const chains = [
  'ethereum',
  'arbitrum',
]

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
};

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => tvl(chain, block)
  }
})

module.exports.ethereum.staking = sumTokensExport({ owner: cvxRewardsAddress, tokens: [cvxAddress] })