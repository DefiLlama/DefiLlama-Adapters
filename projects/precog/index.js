const config = {
  base: {
    masterContract: '0x00000000000c109080dfa976923384b97165a57a',
  },
};

async function tvl(api) {
  const { masterContract } = config[api.chain];
  const marketData = await api.fetchList({ lengthAbi: 'createdMarkets', itemAbi: 'function markets(uint256) view returns (string question, string resolutionCriteria, string imageURL, string category, string outcomes, address creator, address operator, address market, uint256 startTimestamp, uint256 endTimestamp, address collateral)', target: masterContract })
  const tokensAndOwners = marketData.map(m => [m.collateral, m.market])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: "Counts TVL by querying all created markets from the Master contract, summing collateral balances held in each market contract",
  base: { tvl },
};