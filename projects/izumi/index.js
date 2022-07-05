const { sumTokens2, unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')
let bscPools = require('./bscPools.json')
let abi = require('./abi')
const sdk = require('@defillama/sdk')
// const { get } = require('../helper/http')
const { mergeExports } = require('../helper/utils')
const chain = 'bsc'
// const poolEndpoint = 'https://izumi.finance/api/v1/farm/dashboard'

const rewardPoolAbi = {
  "inputs": [],
  "name": "rewardPool",
  "outputs": [
    {
      "internalType": "address",
      "name": "token0",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "token1",
      "type": "address"
    },
    {
      "internalType": "uint24",
      "name": "fee",
      "type": "uint24"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const config = {
  ethereum: {
    // chainId: 1,
    pools: [
      '0x461b154b688D5171934D70F991C17d719082710C',
      '0x57AFF370686043B5d21fDd76aE4b513468B9fb3C',
      '0x8981c60ff02CDBbF2A6AC1a9F150814F9cF68f62',
      '0x99CC0A41F8006385f42aed747e2d3642a226d06E',
      '0x9f58193b717449d00c7dcaf5d9F6f5AF48a09894',
      '0xbE138aD5D41FDc392AE0B61b09421987C1966CC3',
    ],
  },
  polygon: {
    chainId: 137,
    pools: [
      '0x01Cc44fc1246D17681B325926865cDB6242277A5',
      '0x150848c11040F6E52D4802bFFAfFBD57E6264737',
      '0x28d7BFf13c5A1227aEe2E892F8d22d8A1a84A0D4',
      '0xaFD5f7a790041761F33bFbf3dF1b54DF272F2576',
      '0xC0840394978CbCDe9fCCcDE2934636853A524965',
    ],
  },
  arbitrum: {
    chainId: 42161,
    pools: [
      '0x0893eB041c20a34Ce524050711492Fa8377d838b',
      '0x1c0a560EF9f6Ff3f5c2BCCe98dC92f2649a507EF',
      '0xB2DeceA19D58ebe10ab215A04dB2EDBE52E37fA4',
      '0xbE138aD5D41FDc392AE0B61b09421987C1966CC3',
    ],
  },
}

const izumiSwap = {
  bsc: {
    tvl: async (ts, _b, { bsc: block }) => {
      const toa = []
      // const block = await getBlock(ts, chain, chainBlocks, false)

      // const logs = (await sdk.api.util
      //   .getLogs({
      //     keys: [],
      //     toBlock: block,
      //     chain,
      //     target: '0xd7de110bd452aab96608ac3750c3730a17993de0',
      //     fromBlock: 17681022,
      //     topic: 'NewPool(address,address,uint24,uint24,address)',
      //   })).output;
      // bscPools = logs.map(log => `0x${log.data.substr(-40)}`.toLowerCase())

      const calls = bscPools.map(i => ({ target: i }))
      const { output: tokenY } = await sdk.api.abi.multiCall({
        abi: abi.tokenY,
        calls,
        chain, block,
      })
      const { output: tokenX } = await sdk.api.abi.multiCall({
        abi: abi.tokenX,
        calls,
        chain, block,
      })

      tokenX.map(({ output, }, i) => toa.push([output, bscPools[i]]))
      tokenY.map(({ output, }, i) => toa.push([output, bscPools[i]]))



      return sumTokens2({
        tokensAndOwners: toa,
        chain, block
      })
    }
  },
}

const liquidityMining = {}

Object.keys(config).forEach(chain => {
  const { chainId, pools, } = config[chain]
  liquidityMining[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      // let { data: { data: pools } } = await get(`${poolEndpoint}?chainId=${chainId}`)
      // pools = pools.map(i => i.pool_address)
      const { output: poolInfos } = await sdk.api.abi.multiCall({
        abi: rewardPoolAbi,
        calls: pools.map(i => ({ target: i })),
        chain, block,
      })
      const toa = poolInfos.map(({ input, output }) => {
        return [
          [output.token0, input.target,],
          [output.token1, input.target,],
        ]
      }).flat()

      const balances = await sumTokens2({ chain, block, tokensAndOwners: toa, })
      return unwrapUniswapV3NFTs({ chain, block, owners: pools, balances })
    }
  }
})

module.exports = mergeExports([liquidityMining, izumiSwap,])