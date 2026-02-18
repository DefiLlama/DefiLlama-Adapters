const getNumMarkets = "uint256:getNumMarkets";
const getMarketTokenAddress = "function getMarketTokenAddress(uint256 marketId) view returns (address)";
const getMarketTotalPar = "function getMarketTotalPar(uint256 marketId) view returns (tuple(uint128 borrow, uint128 supply))";
const getMarketCurrentIndex = "function getMarketCurrentIndex(uint256 marketId) view returns (tuple(uint96 borrow, uint96 supply, uint32 lastUpdate))";
const BigNumber = require("bignumber.js");

const basePar = '1000000000000000000'

async function getTokensAndBalances(api, supplyOrBorrow) {
  const dolomiteMargin = config[api.chain].margin
  let tokens = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketTokenAddress, target: dolomiteMargin })
  
  const underlyingTokens = await api.multiCall({ abi: 'address:UNDERLYING_TOKEN', calls: tokens, permitFailure: true, })
  let bals
  if (supplyOrBorrow === 'supply') {
    bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(i => ({ target: i, params: dolomiteMargin })), })
  } else {
    const res = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketTotalPar, target: dolomiteMargin })
    const indices = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketCurrentIndex, target: dolomiteMargin })
    bals = res.map((v, i) => BigNumber(v.borrow.toString()).times(indices[i].borrow).div(basePar).toFixed(0))
  }

  const symbols = await api.multiCall({ abi: 'string:symbol', calls: tokens, permitFailure: true, })
  tokens.forEach((v, i) => {
    if (!symbols[i]?.startsWith('pol-')) {
      api.add(underlyingTokens[i] ?? v, bals[i])
    }
  })
}

async function tvl(api) {
  return getTokensAndBalances(api, "supply");
}

async function borrowed(api) {
  return getTokensAndBalances(api, "borrow");
}

module.exports = {
  start: '2022-10-04',  // 10/4/2022 @ 00:00am (UTC)
};

const config = {
  arbitrum: { margin: '0x6bd780e7fdf01d77e4d475c821f1e7ae05409072', },
  btnx: { margin: '0x003Ca23Fd5F0ca87D01F6eC6CD14A8AE60c2b97D', },
  ethereum: { margin: '0x003Ca23Fd5F0ca87D01F6eC6CD14A8AE60c2b97D', },
  polygon_zkevm: { margin: '0x836b557Cf9eF29fcF49C776841191782df34e4e5', },
  mantle: { margin: '0xE6Ef4f0B2455bAB92ce7cC78E35324ab58917De8', },
  xlayer: { margin: '0x836b557Cf9eF29fcF49C776841191782df34e4e5', },
  berachain: { margin: '0x003Ca23Fd5F0ca87D01F6eC6CD14A8AE60c2b97D', },
  // base: { margin: '0x43C2FDB89A1C491F9FE86E1Ff05bd2BE204Ab4aE', },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})
