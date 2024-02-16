const sdk = require('@defillama/sdk')
const axios = require('axios')

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

async function tvl(_0, _1, _2, { api }) {
  for (const token of tokens) {
    const tokenTotalSupply = await api.call({ target: token.address, abi: 'erc20:totalSupply' });
    api.add(token.address, tokenTotalSupply);
    if (!token.sufficientLiquidityForDefiLlamaIndexer) {
      const liquidityPoolAddress = token.priceLiquidityPool;
      const slot0abi = 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint32 feeProtocol, bool unlocked)';
      const slot0 = await api.call({ target: liquidityPoolAddress, abi: slot0abi });
      const tokenPriceUSDT = ((slot0.sqrtPriceX96 / (2 ** 96)) ** 2) * (1e18 / 1e6);
      // the pool implied token price adjusted for token decimals
      api.add(
        '0x919C1c267BC06a7039e03fcc2eF738525769109c', // usdtKavaAddress
        tokenTotalSupply * tokenPriceUSDT * (1e6 / 1e18)
      );
    }
  }
}

module.exports = {
  misrepresentedTokens: true, // false, // until all tokens are indexed by defillama
  timetravel: false, // true, // until all tokens are indexed by defillama
  kava: { tvl, },
  methodology: 'The total supply of their circulating stocks is extracted from their stock token contracts.'
}
