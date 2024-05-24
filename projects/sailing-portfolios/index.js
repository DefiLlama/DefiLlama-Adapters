const portfoliosTrackers = {
  'kava': '0x12c90425dD549DEdD455E223a897E438E2Dc0bbc',
};

async function tvl(api) {
  const portfoliosTracker = portfoliosTrackers[api.chain]
  const portfolios = await api.call({
    target: portfoliosTracker,
    abi: 'function getTrackedPortfolios() external view returns (address[] memory)',
  })
  const tokens = await api.multiCall({  abi: 'address[]:getPortfolioAssets', calls: portfolios})
  const ownerTokens = portfolios.map((portfolio, i) => [tokens[i], portfolio])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  kava: { tvl, },
  methodology: 'The assets in the balancer are detected and counted.'
}
