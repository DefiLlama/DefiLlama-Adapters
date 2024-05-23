const portfoliosTrackers = {
  'kava': '0x12c90425dD549DEdD455E223a897E438E2Dc0bbc',
};

async function tvl(api) {
  const portfoliosTracker = portfoliosTrackers['kava'];
  const portfolios = await api.call({
    target: portfoliosTracker,
    abi: 'function getTrackedPortfolios() external view returns (address[] memory)',
  });
  const tokensAndOwnersPromises = portfolios.map((portfolio) => (async () => {
    const portfolioTokens = await api.call({
      target: portfolio,
      abi: 'function getPortfolioAssets() view public returns (address[] memory)',
    });
    return [portfolioTokens, portfolio];
  })());
  const tokensAndOwners = await Promise.all(tokensAndOwnersPromises);
  return api.sumTokens({ ownerTokens: tokensAndOwners });
}

module.exports = {
  kava: { tvl, },
  methodology: 'The assets in the balancer are detected and counted.'
}
