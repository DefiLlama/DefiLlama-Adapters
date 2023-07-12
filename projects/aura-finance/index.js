const { getLogs } = require('../helper/cache/getLogs')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
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

async function tvl(_, block, _1, { api }) {
  let pools = await Promise.all([AURA_BOOSTER, AURA_BOOSTER_2].map(i => api.fetchList({ target: i, itemAbi: abi.poolInfo, lengthAbi: abi.poolLength, })))
  pools = pools.flat()
  const poolInputs = pools.map(pool => pool.lptoken)
  const poolIds = await api.multiCall({ calls: poolInputs, abi: abi.getPoolId, permitFailure: true, })


  let failedCallIndices = poolIds.map((v, i) => [i, v]).filter(i => !i[1]).map(i => i[0])
  let newPoolIds = await api.multiCall({ calls: failedCallIndices.map(i => poolInputs[i]), abi: 'function POOL_ID() view returns (bytes32)', permitFailure: true, })
  newPoolIds.forEach((v, i) => { if (v) poolIds[failedCallIndices[i]] = v })

  failedCallIndices = poolIds.map((v, i) => [i, v]).filter(i => !i[1]).map(i => i[0])
  const newLpTokens = await api.multiCall({ calls: failedCallIndices.map(i => poolInputs[i]), abi: 'address:lp_token', permitFailure: true, })
  newPoolIds = await api.multiCall({ calls: newLpTokens.map(i => ({ target: i })), abi: abi.getPoolId, permitFailure: true, })
  newPoolIds.forEach((v, i) => { if (v) poolIds[failedCallIndices[i]] = v })


  const poolTokensInfo = await api.multiCall({ calls: poolIds.map(poolId => ({ target: BALANCER_VAULT, params: poolId })), abi: abi.getPoolTokens, })
  const balancesinStaking = await api.multiCall({ calls: pools.map(pool => ({ target: pool.token, params: pool.crvRewards })), abi: 'erc20:balanceOf', })
  const totalSupplies = await api.multiCall({ calls: pools.map(pool => pool.lptoken), abi: 'erc20:totalSupply', })
  const { output: veBalTotalSupply } = await sdk.api.erc20.totalSupply({ target: addresses.veBal, block })
  const { output: veBalance } = await sdk.api.erc20.balanceOf({ target: addresses.veBal, owner: addresses.auraDelegate, block })
  const ratio = veBalance / veBalTotalSupply
  const ratios = balancesinStaking.map((v, i) => +totalSupplies[i] > 0 ? v / totalSupplies[i] : 0)
  const bal = await unwrapBalancerToken({ api, balancerToken: addresses.bal80eth20, owner: addresses.veBal, })
  Object.entries(bal).forEach(([token, value]) => {
    api.add(token, +value * ratio, { skipChain: true, })
  })
  for (let [i, info] of poolTokensInfo.entries()) {
    // // unwrapBalancerToken would be better here, but since crvRewards address holds aura-wrapped tokens, it won't work
    // if (poolIds[i] == "0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249") {
    //   // Pool is 80BAL-20ETH/auraBAL, need to unwrap 80BAL-20ETH
    //   const unwrapped = await unwrapBalancerToken({ block: api.block, balancerPool: addresses.bal80eth20, owner: BALANCER_VAULT })
    //   Object.entries(unwrapped).forEach(([token, balance]) => {
    //     api.add(token, balance * ratio)
    //   })
    // } else {
    info.tokens.forEach((token, j) => {
      api.add(token, info.balances[j] * ratios[i])
    })
    // }
  }
}

const config = {
  arbitrum: { factory: '0x6817149cb753bf529565b4d023d7507ed2ff4bc0', fromBlock: 72942741, voterProxy: '0xc181edc719480bd089b94647c2dc504e2700a2b0'},
  optimism: { factory: '0xa523f47A933D5020b23629dDf689695AA94612Dc', fromBlock: 83239534, voterProxy: '0xc181edc719480bd089b94647c2dc504e2700a2b0'},
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
    tvl: async (_, _b, _cb, { api, }) => {
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
