const config = {
  base: {
    masterContract: '0x00000000000c109080dfa976923384b97165a57a',
  },
};

async function tvl(api) {
  const { masterContract } = config[api.chain];
  const marketData = await api.fetchList({ lengthAbi: 'createdMarkets', itemAbi: 'function markets(uint256) view returns (string question, string resolutionCriteria, string imageURL, string category, string outcomes, address creator, address operator, address market, uint256 startTimestamp, uint256 endTimestamp, address collateral)', target: masterContract })
  const tokensAndOwners = marketData.filter(m => m.collateral && m.market).map(m => [m.collateral, m.market])

  const collateralTokens = [...new Set(marketData.map(m => m.collateral).filter(Boolean))]
  const ownedFlags = await api.multiCall({
    abi: 'function ownedCollaterals(address) view returns (bool)',
    calls: collateralTokens.map(c => ({ target: masterContract, params: [c] })),
  })
  collateralTokens.forEach((c, i) => { if (ownedFlags[i]) tokensAndOwners.push([c, masterContract]) })

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: "Counts TVL by querying all created markets from the Precog Master contract, summing collateral held in each market contract, and including owned launchpad collateral held directly by the Precog Master contract.",
  base: { tvl },
};
