const { getLogs } = require('../helper/cache/getLogs')
const sdk = require("@defillama/sdk");
const abi = {
    "poolLength": "uint256:poolLength",
    "poolInfo": "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)",
    "getPoolId": "function getPoolId() view returns (bytes32)",
    "getPoolTokens": "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
    "getTokenInfo": "function getTokenInfo() view returns (address[] tokens, (uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastBalancesLiveScaled18)"
  };
const { staking } = require("../helper/staking");
const { unwrapBalancerToken } = require('../helper/unwrapLPs')

const AURA_BOOSTER = "0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10"
const AURA_BOOSTER_2 = "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234"
const BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
const addresses = {
  aura: "0xc0c293ce456ff0ed870add98a0828dd4d2903dbf",
  auraLocker: "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC",
  bal: "0xba100000625a3754423978a60c9317c58a424e3d",
  veBal: "0xC128a9954e6c874eA3d62ce62B468bA073093F25",
  auraDelegate: "0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2",
  bal80eth20: "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56",
};

async function addEthV2PoolsTvl(api) {
  let pools = await Promise.all([AURA_BOOSTER, AURA_BOOSTER_2].map(i => api.fetchList({ target: i, itemAbi: abi.poolInfo, lengthAbi: abi.poolLength, })))
  pools = pools.flat()
  const poolInputs = pools.map(pool => pool.lptoken)
  const v2PoolInfos = []
  const v2PoolIds = []

  const failedCallIndices = []
  const failedCallInputs = []

  const poolIds = await api.multiCall({ calls: poolInputs, abi: abi.getPoolId, permitFailure: true, })
  poolIds.forEach((v, i) => {
    if (v) {
      v2PoolIds.push(v)
      v2PoolInfos.push(pools[i])
    } else {
      failedCallInputs.push(poolInputs[i])
      failedCallIndices.push(i)
    }
  })
  let newPoolIds = await api.multiCall({ calls: failedCallInputs, abi: 'function POOL_ID() view returns (bytes32)', permitFailure: true, })

  const failedCallIndices2 = []
  const failedCallInputs2 = []

  newPoolIds.forEach((v, i) => {
    if (v) {
      v2PoolIds.push(v)
      v2PoolInfos.push(pools[failedCallIndices[i]])
    } else {
      failedCallInputs2.push(failedCallInputs[i])
      failedCallIndices2.push(failedCallIndices[i])
    }
  })
  
  
  const isVersion3 = await api.multiCall({ calls: failedCallInputs2, abi: 'address:lp_token', permitFailure: true, })

  const failedCallIndices3 = []
  const failedCallInputs3 = []
  const v3PoolInfos = []
  const v3Pools = []

  isVersion3.forEach((v, i) => {
    if (!v) {
      v3PoolInfos.push(pools[failedCallIndices2[i]])
      v3Pools.push(failedCallInputs2[i])
    } else {
      failedCallInputs3.push(failedCallInputs2[i])
      failedCallIndices3.push(failedCallIndices2[i])
    }
  })

  const newLpTokens = await api.multiCall({ calls: failedCallInputs3, abi: 'address:lp_token', permitFailure: true, })
  newPoolIds = await api.multiCall({ calls: newLpTokens, abi: abi.getPoolId, permitFailure: true, })


  newPoolIds.forEach((v, i) => {
    if (v) {
      v2PoolIds.push(v)
      v2PoolInfos.push(pools[failedCallIndices2[i]])
    } else {
      throw new Error('Failed to get pool id for ' + failedCallInputs3[i])
    }
  })

  const poolTokensInfo = await api.multiCall({ target: BALANCER_VAULT, calls: v2PoolIds, abi: abi.getPoolTokens, })
  const balancesinStaking = await api.multiCall({ calls: v2PoolInfos.map(pool => ({ target: pool.token, params: pool.crvRewards })), abi: 'erc20:balanceOf', })
  const totalSupplies = await api.multiCall({ calls: v2PoolInfos.map(pool => pool.lptoken), abi: 'erc20:totalSupply', })
  const ratios = balancesinStaking.map((v, i) => +totalSupplies[i] > 0 ? v / totalSupplies[i] : 0)

  for (let [i, info] of poolTokensInfo.entries()) {
    info.tokens.forEach((token, j) => {
      api.add(token, info.balances[j] * ratios[i])
    })
  }

  await addEthV3PoolsTvl({ poolInfos: v3PoolInfos, pools: v3Pools, api })
}

async function addEthV3PoolsTvl({ poolInfos, pools, api }) {
  const poolTokensInfo = await api.multiCall({ calls: pools, abi: abi.getTokenInfo, })
  const balancesinStaking = await api.multiCall({ calls: poolInfos.map(pool => ({ target: pool.token, params: pool.crvRewards })), abi: 'erc20:balanceOf', })
  const totalSupplies = await api.multiCall({ calls: poolInfos.map(pool => pool.lptoken), abi: 'erc20:totalSupply', })
  const ratios = balancesinStaking.map((v, i) => +totalSupplies[i] > 0 ? v / totalSupplies[i] : 0)

  for (let [i, info] of poolTokensInfo.entries()) {
    info.tokens.forEach((token, j) => {
      api.add(token, info.balancesRaw[j] * ratios[i])
    })
  }
}

async function tvl(api) {

  await addEthV2PoolsTvl(api) 

  // add veBal tvl
  const veBalTotalSupply = await api.call({ abi: 'erc20:totalSupply', target: addresses.veBal, })
  const veBalance = await api.call({ abi: 'erc20:balanceOf', target: addresses.veBal, params: addresses.auraDelegate, })
  const ratio = veBalance / veBalTotalSupply
  const bal = await unwrapBalancerToken({ api, balancerToken: addresses.bal80eth20, owner: addresses.veBal, })
  Object.entries(bal).forEach(([token, value]) => {
    api.add(token, +value * ratio, { skipChain: true, })
  })
}

const config = {
  base: { factory: '0xb1a4fe1c6d25a0ddab47431a92a723dd71d9021f', fromBlock: 2555348, voterProxy: '0xC181Edc719480bd089b94647c2Dc504e2700a2B0' },
  arbitrum: { factory: '0x6817149cb753bf529565b4d023d7507ed2ff4bc0', fromBlock: 72942741, voterProxy: '0xc181edc719480bd089b94647c2dc504e2700a2b0' },
  optimism: { factory: '0xa523f47A933D5020b23629dDf689695AA94612Dc', fromBlock: 83239534, voterProxy: '0xc181edc719480bd089b94647c2dc504e2700a2b0' },
  polygon: { factory: '0x22625eedd92c81a219a83e1dc48f88d54786b017', fromBlock: 40687417, voterProxy: '0xC181Edc719480bd089b94647c2Dc504e2700a2B0' },
  xdai: { factory: '0x83E443EF4f9963C77bd860f94500075556668cb8', fromBlock: 27088527, voterProxy: '0xC181Edc719480bd089b94647c2Dc504e2700a2B0' },
  polygon_zkevm: { factory: '0x2498A2B0d6462d2260EAC50aE1C3e03F4829BA95', fromBlock: 203652, voterProxy: '0xC181Edc719480bd089b94647c2Dc504e2700a2B0' },
  avax: { factory: '0xf23b4DB826DbA14c0e857029dfF076b1c0264843', fromBlock: 32558551, voterProxy: '0xC181Edc719480bd089b94647c2Dc504e2700a2B0' },
  fraxtal: { factory: '0xc3ccacE87f6d3A81724075ADcb5ddd85a8A1bB68', fromBlock: 4712390, voterProxy: '0xC181Edc719480bd089b94647c2Dc504e2700a2B0' },
}

module.exports = {
  methodology: "TVL of Aura Finance consists of the total deposited assets, protocol-controlled value via veBAL and vote-locked AURA (staking)",
  ethereum: {
    tvl,
    staking: staking(addresses.auraLocker, addresses.aura)
  }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, voterProxy, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xaa98436d09d130af48de49867af8b723bbbebb0d737638b5fe8f1bf31bbb71c0'],
        eventAbi: 'event GaugeCreated (address indexed gauge)',
        onlyArgs: true,
        fromBlock,
      })

      // const auraBalVault = '0x4EA9317D90b61fc28C418C247ad0CA8939Bbb0e9'
      // const asset = await api.call({  abi: 'address:asset', target: auraBalVault })
      // const bal = await api.call({  abi: 'uint256:totalAssets', target: auraBalVault })
      // api.add(asset, bal)
      const gauges = logs.map(log => log.gauge)
      const tokens = await api.multiCall({ abi: 'address:lp_token', calls: gauges })
      const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gauges.map(i => ({ target: i, params: voterProxy })) })
      api.addTokens(tokens, bals)
    }
  }
})