const sdk = require('@defillama/sdk')

const tokens = [
  {
    "address": "0x75B5DACEc8DACcb260eA47549aE882513A21CE01",
    "ticker": "SPY",
    "sufficientLiquidityForDefiLlamaIndexer": false,
    "priceLiquidityPool": "0xeA55Df929438f8A1af003A59381ba57aB2f3fb1f",
  },
  {
    "address": "0x2E4763AdBEe00D5eB3089ec25973599c0e62dD07",
    "ticker": "ARKK",
    "sufficientLiquidityForDefiLlamaIndexer": false,
    "priceLiquidityPool": "0x56742D48Fd18C236aCEd6317c192eCFB2d4bd792",
  }
];

const averagePoolPrice24Hrs = async ({
  poolAddress,
  lastBlockNumber,
  api,
}) => {
  const slot0abi = 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint32 feeProtocol, bool unlocked)';
  const getTokenPriceAtBlock = async (queryBlockNumber) => {
    const slot0 = await api.call({
      target: poolAddress,
      abi: slot0abi,
      block: queryBlockNumber
    });
    // below formula is token price in USDT denomination, adjusted for token decimals
    return ((slot0.sqrtPriceX96 / (2 ** 96)) ** 2) * (1e18 / 1e6);
  };
  let priceAverageAggregate = 0;
  const blocksPerHour = 1833;
  for (let i = 0; i < 24; i++) {
    priceAverageAggregate += await getTokenPriceAtBlock(
      lastBlockNumber - i * blocksPerHour
    );
  }
  return priceAverageAggregate / 24;
};  

async function tvl(_0, blockNumber, _2, { api }) {
  for (const token of tokens) {
    try {
      // try block to support time traveling, as more token tickers are added over time
      const tokenTotalSupply = await api.call({ target: token.address, abi: 'erc20:totalSupply' });
      api.add(token.address, tokenTotalSupply);
      if (!token.sufficientLiquidityForDefiLlamaIndexer) {
        // pool has low liquidity so price is aggregated over 24 hours
        const tokenPriceUSDT = await averagePoolPrice24Hrs({
          poolAddress: token.priceLiquidityPool,
          lastBlockNumber: blockNumber,
          api
        });
        api.add(
          '0x919C1c267BC06a7039e03fcc2eF738525769109c', // usdtKavaAddress
          tokenTotalSupply * tokenPriceUSDT * (1e6 / 1e18)
        );
      }
    } catch {};
  }
}

module.exports = {
  misrepresentedTokens: true, // false, // until all tokens are indexed by defillama
  timetravel: true,
  kava: { tvl, },
  methodology: 'The total supply of their circulating stocks is extracted from their stock token contracts.'
}
