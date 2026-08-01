const { getLogs2 } = require('../helper/cache/getLogs');

const getMarketsDetailsAbi = 'function getMarketsDetails(address covenantLiquid, bytes20[] marketIds) view returns ((bytes20 marketId, (address tokenAddress, uint8 decimals, uint256 totalSupply, string name, string symbol) baseToken, (address tokenAddress, uint8 decimals, uint256 totalSupply, string name, string symbol) quoteToken, (address tokenAddress, uint8 decimals, uint256 totalSupply, string name, string symbol) aToken, (address tokenAddress, uint8 decimals, uint256 totalSupply, string name, string symbol) zToken, (address baseToken, address quoteToken, address curator, address lex) marketParams, (uint256 baseSupply, uint128 protocolFeeGrowth, address authorizedPauseAddress, uint8 statusFlag) marketState, (uint256 lastDebtNotionalPrice, uint256 lastBaseTokenPrice, uint256 lastETWAPBaseSupply, uint160 lastSqrtPriceX96, uint96 lastUpdateTimestamp, int64 lastLnRateBias) lexState, (uint32 protocolFee, address aToken, address zToken, uint8 noCapLimit, int8 scaleDecimals, bool adaptive) lexConfig, (address covenantCore, int64 initLnRateBias, uint160 edgeSqrtPriceX96_B, uint160 edgeSqrtPriceX96_A, uint160 limHighSqrtPriceX96, uint160 limMaxSqrtPriceX96, uint32 debtDuration, uint8 swapFee, uint256 targetXvsL) lexParams, uint32 currentLTV, uint32 targetLTV, uint128 debtPriceDiscount, (uint256 baseTokenPrice, uint256 aTokenPrice, uint256 zTokenPrice) tokenPrices)[] marketsDetails)';

const createMarketEvent =
  'event CreateMarket(bytes20 indexed marketId, (address baseToken, address quoteToken, address curator, address lex) marketParams, (address aToken, address zToken) synthTokens, bytes initData, bytes lexData)';

const config = {
  monad: {
    dataProvider: '0x3818a6d5018aa9eb69b6bce09e38a7c24bbe8c22',
    covenant: '0x11a7ab0a9d7bd531dbcf0f0630bf7167f8f198f6',
    fromBlock: 35851140,
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'Value of all assets in the covenant contract',
};

Object.keys(config).forEach(chain => {
  const { dataProvider, covenant, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, target: covenant, fromBlock, eventAbi: createMarketEvent, });

      const marketIds = logs.map((l) => l.marketId);
      const details = await api.call({
        target: dataProvider, abi: getMarketsDetailsAbi, params: [covenant, marketIds],
      });
      const markets = details.filter((d) => Number(d.marketState.statusFlag) !== 0);
      const baseTokens = markets.map((m) => m.baseToken.tokenAddress);
      return api.sumTokens({ tokens: baseTokens, owner: covenant, permitFailure: true, })
    }
  }
})
