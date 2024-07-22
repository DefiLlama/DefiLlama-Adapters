const portfoliosTrackers = {
  kava: '0x12c90425dD549DEdD455E223a897E438E2Dc0bbc',
};

const uniswapV3Factories = {
  kava: '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B',
};

const usdtAddresses = {
  kava: '0x919C1c267BC06a7039e03fcc2eF738525769109c',
};

function calculatePrice(tokenValue, sqrtPriceX96) {
  const priceInUsdt = (Number(sqrtPriceX96) ** 2) / (2 ** 192);
  return Math.floor(Number(tokenValue) * priceInUsdt);
}

async function fetchTrackedPortfolios(api, portfoliosTracker) {
  return await api.call({
    target: portfoliosTracker,
    abi: 'function getTrackedPortfolios() external view returns (address[] memory)',
  });
}

async function fetchPortfolioAssets(api, portfolios) {
  return await api.multiCall({ abi: 'address[]:getPortfolioAssets', calls: portfolios });
}

async function fetchUniswapPoolAddress(api, uniswapV3Factory, tokenAddress, usdtAddress) {
  return await api.call({
    target: uniswapV3Factory,
    abi: 'function getPool(address, address, uint24) view returns (address)',
    params: [tokenAddress, usdtAddress, 500],
  });
}

async function fetchSlot0(api, poolAddress) {
  return await api.call({
    target: poolAddress,
    abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  });
}

async function tvl(api) {
  const portfoliosTracker = portfoliosTrackers[api.chain];
  const portfolios = await fetchTrackedPortfolios(api, portfoliosTracker);

  const tokens = await fetchPortfolioAssets(api, portfolios);
  const ownerTokens = portfolios.map((portfolio, i) => [tokens[i], portfolio]);
  const sum = await api.sumTokens({ ownerTokens });

  const tokenAddress = Object.keys(sum).length > 0 ? Object.keys(sum)[0].split(':')[1] : null;

  const uniswapV3Factory = uniswapV3Factories[api.chain];
  const usdtAddress = usdtAddresses[api.chain];
  const poolAddress = await fetchUniswapPoolAddress(api, uniswapV3Factory, tokenAddress, usdtAddress);

  const slot0 = await fetchSlot0(api, poolAddress);

  const totalValue = Object.values(sum).length > 0 ? Object.values(sum)[0] : null;
  const priceInUsdt = {
    [`${api.chain}:${usdtAddress}`]: calculatePrice(totalValue, slot0.sqrtPriceX96),
  };

  return priceInUsdt;
}

module.exports = {
  kava: { tvl },
  misrepresentedTokens: true,
  methodology: 'The assets in the balancer are detected and counted.',
};
