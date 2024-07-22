const portfoliosTrackers = {
  kava: '0x12c90425dD549DEdD455E223a897E438E2Dc0bbc',
};

const uniswapV3Factories = {
  kava: '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B',
};

const usdtAddresses = {
  kava: '0x919C1c267BC06a7039e03fcc2eF738525769109c',
};

const feeTiers = [500, 1000, 3000];

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

async function fetchUniswapPoolAddress(api, uniswapV3Factory, tokenAddress, usdtAddress, fee) {
  return await api.call({
    target: uniswapV3Factory,
    abi: 'function getPool(address, address, uint24) view returns (address)',
    params: [tokenAddress, usdtAddress, fee],
  });
}

async function fetchSlot0(api, poolAddress) {
  return await api.call({
    target: poolAddress,
    abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  });
}

async function fetchTokenBalance(api, tokenAddress, poolAddress) {
  return await api.call({
      target: tokenAddress,
      abi: 'function balanceOf(address) view returns (uint256)',
      params: [poolAddress],
  });
}

async function getPools(api, tokenAddress, usdtAddress) {
  const uniswapV3Factory = uniswapV3Factories[api.chain];
  const pools = [];

  for (const fee of feeTiers) {
    const poolAddress = await fetchUniswapPoolAddress(api, uniswapV3Factory, tokenAddress, usdtAddress, fee);
    if (poolAddress !== '0x0000000000000000000000000000000000000000') {
      pools.push(poolAddress);
    }
  }

  return pools;
}

async function findBestPoolWithLiquidity(api, pools, tokenAddress, usdtAddress, minLiquidity) {
  let bestPool = null;
  let bestLiquidity = 0;

  for (const poolAddress of pools) {
    const slot0 = await fetchSlot0(api, poolAddress);
    const sqrtPriceX96 = slot0.sqrtPriceX96;

    const balanceOfToken0 = await fetchTokenBalance(api, tokenAddress, poolAddress);
    const balanceOfToken1 = await fetchTokenBalance(api, usdtAddress, poolAddress);
    const pricePerTokenInUsdt = (Number(sqrtPriceX96) ** 2) / (2 ** 192);

    const resultOfTVLPoolInUsd = (balanceOfToken0 * pricePerTokenInUsdt) + balanceOfToken1;

    if (resultOfTVLPoolInUsd >= minLiquidity && resultOfTVLPoolInUsd > bestLiquidity) {
      bestPool = poolAddress;
      bestLiquidity = resultOfTVLPoolInUsd;
    }
  }
  
  return bestPool;
}

async function tvl(api) {
  const portfoliosTracker = portfoliosTrackers[api.chain];
  const portfolios = await fetchTrackedPortfolios(api, portfoliosTracker);

  const tokens = await fetchPortfolioAssets(api, portfolios);
  const ownerTokens = portfolios.map((portfolio, i) => [tokens[i], portfolio]);
  const sum = await api.sumTokens({ ownerTokens });

  const tokenAddress = Object.keys(sum).length > 0 ? Object.keys(sum)[0].split(':')[1] : null;
  const usdtAddress = usdtAddresses[api.chain];

  const pools = await getPools(api, tokenAddress, usdtAddress);
  const poolAddress = await findBestPoolWithLiquidity(api, pools, tokenAddress, usdtAddress, 50000);

  if (!poolAddress) {
    return {};
  }

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
