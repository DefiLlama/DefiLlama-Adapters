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

const cappedTokens = {
  "0x5aC39Ed42e14Cf330A864d7D1B82690B4D1B9E61": {
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    symbol: 'MATIC',
    decimals: 18,
  },
  "0xfb42f5AFb722d2b01548F77C31AC05bf80e03381": {
    address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
    symbol: 'ENS',
    decimals: 18,
  },
  "0x05498574BD0Fa99eeCB01e1241661E7eE58F8a85": {
    address: '0xba100000625a3754423978a60c9317c58a424e3d',
    symbol: 'BAL',
    decimals: 18,
  },
  "0xd3bd7a8777c042De830965de1C1BCC9784135DD2": {
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    symbol: 'AAVE',
    decimals: 18,
  },
  "0x7C1Caa71943Ef43e9b203B02678000755a4eCdE9": {
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    symbol: 'LDO',
    decimals: 18,
  },
  "0xDDB3BCFe0304C970E263bf1366db8ed4DE0e357a": {
    address: '0x92d6c1e31e14520e676a687f0a93788b716beff5',
    symbol: 'DYDX',
    decimals: 18,
  },
  "0x9d878eC06F628e883D2F9F1D793adbcfd52822A8": {
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    symbol: 'CRV',
    decimals: 18,
  },
  "0x64eA012919FD9e53bDcCDc0Fc89201F484731f41": {
    address: '0xae78736cd615f374d3085123a210448e74fc6393',
    symbol: 'rETH',
    decimals: 18,
  },
  "0x99bd1f28a5A7feCbE39a53463a916794Be798FC3": {
    address: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    symbol: 'cbETH',
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
      if (cappedTokens[token] != undefined){
        token = cappedTokens[token].address
      }
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
  Capped tokens converted 1:1 to underlying
  `
};
