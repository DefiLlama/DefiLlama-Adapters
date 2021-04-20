const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require('bignumber.js')

// V1
const hubAddress = '0xdfa6edAe2EC0cF1d4A60542422724A48195A5071';
const tokenDenominationAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
//V3
const routers = ['0xe3cF69b86F274a14B87946bf641f11Ac837f4492', '0xe6887c0cc3c37cb2ee34Bc58AB258f36825CA910', '0xE540998865aFEB054021dc849Cc6191b8E09dC08']
const ethereumTokens = ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', '0x0f5d2fb29fb7d3cfee444a200298f468908cc942', '0x6b175474e89094c44da98b954eedeac495271d0f']
const bscTokens = ['0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', '0x55d398326f99059fF775485246999027B3197955', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d']
const polygonSettings = {
  nativeCoin: 'matic-network',
  tokens: [
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      coingeckoId: 'dai',
    },
    {
      address: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
      coingeckoId: 'decentraland'
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      coingeckoId: 'tether'
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      coingeckoId: 'usd-coin'
    }
  ]
}
const xdaiSettings = {
  nativeCoin: 'dai',
  tokens: [
    {
      address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      coingeckoId: 'usd-coin'
    },
    {
      address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
      coingeckoId: 'tether'
    },
  ]
}


function mergeBalances(balances, balancesToMerge) {
  Object.entries(balancesToMerge).forEach(balance => {
    sdk.util.sumSingleBalance(balances, balance[0], balance[1])
  })
}

function constructBalanceOfCalls(tokens, useAddressProp){
  const calls = []
  for(const router of routers){
    for(const token of tokens){
      const address = useAddressProp?token.address:token
      calls.push({
        target: address,
        params: [router]
      })
    }
  }
  return calls
}

async function getRouterBalances(timestamp, chain, settings){
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain
  })
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    calls: constructBalanceOfCalls(settings.tokens, true),
    chain
  })
  const tokenDecimals = await sdk.api.abi.multiCall({
    abi: 'erc20:decimals',
    block,
    calls: settings.tokens.map(token => ({
      target: token.address,
    })),
    chain
  })
  const nativeBalances = await sdk.api.eth.getBalances({
    targets: routers,
    block,
    chain,
  })
  const totalNativeBalance = nativeBalances.output.reduce((acc, output)=>acc.plus(output.balance), BigNumber(0))
  const balances = {}
  balances[settings.nativeCoin] = totalNativeBalance.div(1e18).toFixed(0)
  routerBalances.output.forEach((result)=>{
    const tokenIndex = settings.tokens.findIndex(token=>result.input.target.toLowerCase()===token.address.toLowerCase())
    const coingeckoId = settings.tokens[tokenIndex].coingeckoId
    const decimals = Number(tokenDecimals.output[tokenIndex].output)
    sdk.util.sumSingleBalance(balances, coingeckoId, BigNumber(result.output).div(10**decimals).toFixed(0))
  })
  return balances;
}

async function ethereum(timestamp, block) {
  // V1
  const totalChannelToken = (await sdk.api.abi.call({
    block,
    target: hubAddress,
    abi: abi['totalChannelToken'],
  })).output;

  const balances = { [tokenDenominationAddress]: totalChannelToken };

  // V2
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    calls: constructBalanceOfCalls(ethereumTokens, false)
  })
  sdk.util.sumMultiBalanceOf(balances, routerBalances);

  return balances
}

async function bsc(timestamp) {
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain:'bsc'
  })
  const balances={}
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    chain:'bsc',
    calls: constructBalanceOfCalls(bscTokens, false)
  })
  routerBalances.output.forEach(result=>{
    sdk.util.sumSingleBalance(balances, `bsc:${result.input.target}`, result.output)
  })
  return balances
}

async function polygon(timestamp, block) {
  return getRouterBalances(timestamp, 'polygon', polygonSettings)
}

async function xdai(timestamp, block) {
  return getRouterBalances(timestamp, 'xdai', xdaiSettings)
}

async function tvl(timestamp, block) {
  const balances = {};
  const chainBalances = await Promise.all([
    ethereum(timestamp, block),
    polygon(timestamp, block),
    xdai(timestamp, block),
    bsc(timestamp, block)
  ])
  chainBalances.forEach(chainBalance => mergeBalances(balances, chainBalance))
  return balances
}

module.exports = {
  start: 1552065900,  // 03/08/2019 @ 5:25pm (UTC)
  tvl,
  ethereum: {
    tvl: ethereum
  },
  polygon: {
    tvl: polygon
  },
  xdai: {
    tvl: xdai
  },
  bsc:{
    bsc: bsc
  }
};
