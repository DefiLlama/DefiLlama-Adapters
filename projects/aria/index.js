const { transformDexBalances } = require('../helper/portedTokens');

// Contract addresses
const APL_TOKEN = '0xfE82012eCcE57a188E5f9f3fC1Cb2D335C58F1f5';
const STAPL_TOKEN = '0xb5461c1FD0312Cd4bF037058F8a391e6A42F9639';
const STAKING_CONTRACT = '0x73d600Db8E7bea28a99AED83c2B62a7Ea35ac477';
const APL_USDC_POOL = '0xb6a137017a2414ecb7de6f0599581d1ab9c3ade3'; // PiperX v3 pool
const USDC_E = '0xf1815bd50389c46847f0bda824ec8da914045d14';

async function tvl(api) {
  // Get staked APL balance
  const aplBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: APL_TOKEN,
    params: [STAKING_CONTRACT],
  });

  // sqrtPriceX96 calculation
  const [slot0, token0] = await Promise.all([
      api.call({
      abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
      target: APL_USDC_POOL,
      }),
      api.call({ abi: 'address:token0', target: APL_USDC_POOL }),
  ]);

  const sqrtPriceX96 = slot0.sqrtPriceX96;
  const price = (sqrtPriceX96 ** 2) / (2 ** 192);

  let aplPriceInUSDC;
  if (token0.toLowerCase() === USDC_E.toLowerCase()) {
      aplPriceInUSDC = price / (10 ** 12);
  } else {
      aplPriceInUSDC = (10 ** 12) / price;
  }

  aplPriceInUSDC = 1 / aplPriceInUSDC;
  const tvlUSD = (aplBalance / 1e18) * aplPriceInUSDC;
  api.add(USDC_E, tvlUSD * 1e6);
}

module.exports = {
  methodology: 'Counts APL tokens staked in the IPRWA staking contract. APL tokens are backed by royalty revenue from IP assets.',
  start: 5630479, // Aria Launch (June 25, 2025)
  sty: {
    tvl,
  },
  hallmarks: [
    [1750880683, "Protocol Launch"], // Jun 25 2025 12:44:43 PM PDT
  ],
};