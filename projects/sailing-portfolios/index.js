const BigNumber = require('bignumber.js')

const portfoliosTrackers = {
  'kava': '0x12c90425dD549DEdD455E223a897E438E2Dc0bbc',
};

const UniswapV3Factorys = {'kava': '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B',}
const usdtAddresses = {'kava': '0x919C1c267BC06a7039e03fcc2eF738525769109c',}

function _calculatePrice(tokenValue, poolUsdtValueInsqrtPriceX96) {
  const poolPriceInUsdt = Number(poolUsdtValueInsqrtPriceX96 ** 2) /( 2 ** 96);
  console.log("AAAAAAAAA", tokenValue)
  console.log("BBBBBBBBB", poolPriceInUsdt)

  return Math.floor(Number(tokenValue) * poolPriceInUsdt)
}

async function tvl(api) {
  const portfoliosTracker = portfoliosTrackers[api.chain]
  const portfolios = await api.call({
    target: portfoliosTracker,
    abi: 'function getTrackedPortfolios() external view returns (address[] memory)',
  })

  const tokens = await api.multiCall({ abi: 'address[]:getPortfolioAssets', calls: portfolios })
  const ownerTokens = portfolios.map((portfolio, i) => [tokens[i], portfolio])
  const sum = await api.sumTokens({ ownerTokens })

  // Extraer solo la dirección del token
  const keys = Object.keys(sum);
  const tokenAddress = keys.length > 0 ? keys[0].split(':')[1] : null;

  const UniswapV3Factory = UniswapV3Factorys[api.chain]
  const usdtAddress = usdtAddresses[api.chain]
  const poolAddress = await api.call({
    target: UniswapV3Factory,
    abi: 'function getPool(address, address, uint24) view returns (address)',
    params: [tokenAddress, usdtAddress, 500],
  })
  
  const slot0 = await api.call({
    target: poolAddress,
    abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  })

  // Extraer solo el valor del token
  const values = Object.values(sum);
  const totalValue = values.length > 0 ? values[0] : null;

  console.log("Amount of SAILs tokens", totalValue)
  console.log("SAILs price in USDT", slot0.sqrtPriceX96)
  console.log("TVL SAILs price in USDT", _calculatePrice(totalValue, slot0.sqrtPriceX96))

  console.log(sum)

  const priceInUSDT = _calculatePrice(totalValue, slot0.sqrtPriceX96);

  const result = {
    [`${api.chain}:${tokenAddress}`]: priceInUSDT,
  };

  console.log(result)

  return result
}

module.exports = {
  kava: { tvl, },
  misrepresentedTokens: true,
  methodology: 'The assets in the balancer are detected and counted.'
}
