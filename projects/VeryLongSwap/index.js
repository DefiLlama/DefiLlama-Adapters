const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  astrzk: {
    singleStakeTarget: '0x1AbF3A81aeb18a0EF9F5e319d7ec7483B45456fa', 
    factory: '0x287fAE8c400603029c27Af0451126b9581B6fcD4',
    singleStakeFromBlock: 2217243,
    factoryFromBlock: 156301
  }
}
const poolLengthABI = {
  "inputs": [],
  "name": "poolLength",
  "outputs": [
      {
          "internalType": "uint256",
          "name": "length",
          "type": "uint256"
      }
  ],
  "stateMutability": "view",
  "type": "function"
}
const poolsABI = {
  "inputs": [
      {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
      }
  ],
  "name": "pools",
  "outputs": [
      {
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
      },
      {
          "internalType": "uint32",
          "name": "endDay",
          "type": "uint32"
      },
      {
          "internalType": "uint32",
          "name": "lockDayPercent",
          "type": "uint32"
      },
      {
          "internalType": "uint32",
          "name": "unlockDayPercent",
          "type": "uint32"
      },
      {
          "internalType": "uint32",
          "name": "lockPeriod",
          "type": "uint32"
      },
      {
          "internalType": "uint32",
          "name": "withdrawalCut1",
          "type": "uint32"
      },
      {
          "internalType": "uint32",
          "name": "withdrawalCut2",
          "type": "uint32"
      },
      {
          "internalType": "bool",
          "name": "depositEnabled",
          "type": "bool"
      },
      {
          "internalType": "uint128",
          "name": "maxDeposit",
          "type": "uint128"
      },
      {
          "internalType": "uint128",
          "name": "minDeposit",
          "type": "uint128"
      },
      {
          "internalType": "uint128",
          "name": "totalDeposited",
          "type": "uint128"
      },
      {
          "internalType": "uint128",
          "name": "maxPoolAmount",
          "type": "uint128"
      }
  ],
  "stateMutability": "view",
  "type": "function"
}

const uniswapConfig = {
  eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
  topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
}

Object.keys(config).forEach(chain => {
  const factories = config[chain]
  module.exports[chain] = {

    tvl: async (api) => {
      const poolLength = await api.call({
        abi: poolLengthABI,
        target: factories.singleStakeTarget,
        params: [],
      });
      const poolsData = await api.batchCall([...Array(Number(poolLength[0])).keys()].map(i => {
        return { target: factories.singleStakeTarget, params: i, abi: poolsABI }
      }))
      poolsData.forEach(pool => {
        api.add(pool.token, pool.totalDeposited)
      })
      
      const logs = await getLogs({
        api,
        target: factories.factory,
        topics: uniswapConfig.topics,
        fromBlock: factories.factoryFromBlock,
        eventAbi: uniswapConfig.eventAbi,
        onlyArgs: true,
      })

      return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]), permitFailure: logs.length > 2000 })
    }
  }
})
