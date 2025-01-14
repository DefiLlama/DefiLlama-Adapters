const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require('bignumber.js')

// V1
const hubAddress = '0xdfa6edAe2EC0cF1d4A60542422724A48195A5071';
const tokenDenominationAddress = ADDRESSES.ethereum.DAI;
//V3
const routers = ['0xe3cF69b86F274a14B87946bf641f11Ac837f4492', '0xe6887c0cc3c37cb2ee34Bc58AB258f36825CA910', '0xE540998865aFEB054021dc849Cc6191b8E09dC08', '0xC6C68811E75EfD86d012587849F1A1D30427361d']
const ethereumTokens = [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.MATIC, '0x0f5d2fb29fb7d3cfee444a200298f468908cc942', ADDRESSES.ethereum.DAI]
const bscTokens = ['0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC]
const polygonSettings = {
  nativeCoin: 'matic-network',
  tokens: [
    {
      address: ADDRESSES.polygon.DAI,
      coingeckoId: 'dai',
    },
    {
      address: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
      coingeckoId: 'decentraland'
    },
    {
      address: ADDRESSES.polygon.USDT,
      coingeckoId: 'tether'
    },
    {
      address: ADDRESSES.polygon.USDC,
      coingeckoId: 'usd-coin'
    }
  ]
}
const xdaiSettings = {
  nativeCoin: 'dai',
  tokens: [
    {
      address: ADDRESSES.xdai.USDC,
      coingeckoId: 'usd-coin'
    },
    {
      address: ADDRESSES.xdai.USDT,
      coingeckoId: 'tether'
    },
  ]
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

async function getRouterBalances(timestamp, chain, settings, block){
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

async function bsc(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc
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

async function polygon(timestamp, ethBlock, {polygon: block}) {
  return getRouterBalances(timestamp, 'polygon', polygonSettings, block)
}

async function xdai(timestamp, ethBlock, {xdai: block}) {
  return getRouterBalances(timestamp, 'xdai', xdaiSettings, block)
}

module.exports = {
  start: '2019-03-08',  // 03/08/2019 @ 5:25pm (UTC)
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
    tvl: bsc
  }
};
