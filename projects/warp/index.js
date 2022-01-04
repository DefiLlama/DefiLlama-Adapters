const sdk = require('@defillama/sdk')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')

function isLP(symbol){
  return symbol.includes('LP') || symbol === "UNI-V2"
}

async function tvl(_timestamp, block){
  const balances = {}
  for(const group of tokenHolderMap){
    const holders = await sdk.api.util.getLogs({
      ...group.holders.logConfig,
      keys: [],
      toBlock: block
    }).then(logs=>logs.output.map((poolLog) => `0x${poolLog.data.substr(26, 40)}`))
    const tokens = await sdk.api.abi.multiCall({
      calls: holders.map(h=>({target: h})),
      block,
      abi: group.tokens.abi
    })
    const symbols = (await sdk.api.abi.multiCall({
      calls: tokens.output.map(t=>({target: t.output})),
      block,
      abi: 'erc20:symbol'
    })).output
    await sumTokensAndLPsSharedOwners(balances, 
      tokens.output.map((t, i)=>[t.output, isLP(symbols[i].output)]),
      holders, block
    )
  }
  return balances
}

module.exports = {
  start: 1610650220,
  tvl
}

const tokenHolderMap = [
  {
    holders: {
      pullFromLogs: true,
      logConfig: {
        target: "0x6C74E2A1074ABe18969Be37210B93e681A40b35A",
        topic: "NewLPVault(address)",
        fromBlock: 11803584,
      },
      transform: (poolLog) => `0x${poolLog.substr(26, 40)}`,
    },
    tokens: {
      pullFromPools: true,
      abi: {
        inputs: [],
        name: "LPtoken",
        outputs: [
          {
            internalType: "contract IUniswapV2ERC20",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    },
  },
  {
    holders: {
      pullFromLogs: true,
      logConfig: {
        target: "0x6C74E2A1074ABe18969Be37210B93e681A40b35A",
        topic: "NewSCVault(address,address)",
        fromBlock: 11803584,
      },
      transform: (poolLog) => `0x${poolLog.substr(26, 40)}`,
    },
    tokens: {
      pullFromPools: true,
      abi: {
        inputs: [],
        name: "stablecoin",
        outputs: [
          {
            internalType: "contract ERC20",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    },
  },
  {
    holders: {
      pullFromLogs: true,
      logConfig: {
        target: "0x8E0Fa7c5C7Fa86A059e865A90b50a90351df716a",
        topic: "NewLPVault(address)",
        fromBlock: 11654924,
      },
      transform: (poolLog) => `0x${poolLog.substr(26, 40)}`,
    },
    tokens: {
      pullFromPools: true,
      abi: {
        inputs: [],
        name: "LPtoken",
        outputs: [
          {
            internalType: "contract IUniswapV2ERC20",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    },
  },
  {
    holders: {
      pullFromLogs: true,
      logConfig: {
        target: "0x8E0Fa7c5C7Fa86A059e865A90b50a90351df716a",
        topic: "NewSCVault(address,address)",
        fromBlock: 11654924,
      },
      transform: (poolLog) => `0x${poolLog.substr(26, 40)}`,
    },
    tokens: {
      pullFromPools: true,
      abi: {
        inputs: [],
        name: "stablecoin",
        outputs: [
          {
            internalType: "contract ERC20",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    },
  },
]
