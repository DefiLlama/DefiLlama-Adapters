const sdk = require('@defillama/sdk');
const {lendingMarket} = require('../helper/methodologies')

const VaultController = "0x4aaE9823Fb4C70490F1d802fC697F3ffF8D5CbE3"

const vaultSummaryAbi = {
  "inputs":
  [
    {
      "internalType": "uint96",
      "name": "start",
      "type": "uint96"
    },
    {
      "internalType": "uint96",
      "name": "stop",
      "type": "uint96"
    }
  ],
  "name": "vaultSummaries",
  "outputs":
  [
    {
      "components":
      [
        {
          "internalType": "uint96",
          "name": "id",
          "type": "uint96"
        },
        {
          "internalType": "uint192",
          "name": "borrowingPower",
          "type": "uint192"
        },
        {
          "internalType": "uint192",
          "name": "vaultLiability",
          "type": "uint192"
        },
        {
          "internalType": "address[]",
          "name": "tokenAddresses",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "tokenBalances",
          "type": "uint256[]"
        }
      ],
      "internalType": "struct IVaultController.VaultSummary[]",
      "name": "",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const tokens = {
  "WETH": {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
  },
  "USDC": {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
  },
  "WTC":{
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    decimals: 8,
  },
  "UNI":{
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    symbol: 'UNI',
    decimals: 18,
  },
  "USDI":{
    address: "0x2A54bA2964C8Cd459Dc568853F79813a60761B58",
    symbol: 'USDI',
    decimals: 18,
  },
}

const getVaultCount = async (block) => {
  return (await sdk.api.abi.call({
    block,
    target: VaultController,
    params: [],
    abi: {name:"vaultsMinted", type:"function",stateMutability:"view",outputs:[{internalType:"uint96",type:"uint96"}]},
  })).output;
}

const getVaults = async (block) => {
  return getVaultCount()
    .then(async (c)=>{
      return (await sdk.api.abi.call({
        block,
        target: VaultController,
        params: [1,c],
        abi: vaultSummaryAbi,
      })).output;
    })
}

const getReserve = async (block) =>{
  return (await sdk.api.abi.call({
    block,
    target: tokens.USDC.address,
    params: [tokens.USDI.address],
    abi: "erc20:balanceOf",
  })).output;
}

const collateral = async (timestamp, block)=>{
  const balances = {}
  const vaults = await getVaults()
  vaults.forEach(x=>{
    x.tokenAddresses.forEach((token, i)=>{
      sdk.util.sumSingleBalance(balances, token, x.tokenBalances[i])
    })
  })
  return balances
}
const borrowed = async (timestamp, block) => {
  const balances = {}
  const vaults = await getVaults()
  vaults.forEach(x=>{
      sdk.util.sumSingleBalance(balances, tokens.USDI.address, x.vaultLiability)
  })
  return balances
}


const tvl = async (timestamp, block) => {
  const coll = await collateral(timestamp, block)
  const reserve = await getReserve(block)
  const balances  = {
    [tokens.USDC.address]: reserve,
    ...coll
  }
  return balances
}

module.exports = {
  timetravel: true,
  start: 14962974,
  ethereum: {
    tvl,
    borrowed
  },
  methodology: `${lendingMarket}.
  For Interest Protocol, TVL is Reserve + Total Collateral Value
  Reserve is found through calling USDC.getBalances(USDI)
  Balances are found through VaultController.vaultSummaries(1,VaultController.vaultsMinted())
  `
};
