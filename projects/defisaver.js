async function tvl(api) {
  const chainId = api.chainId;

  // Endpoint returns data calculated by these two packages:
  //
  // 1. https://github.com/defisaver/automation-sdk
  // 2. https://github.com/defisaver/defisaver-positions-sdk/
  //
  // By getting subscription data from the first package you can calculate balances for each position using `get${protocol_name_here}AccountBalances` method from the second package
  //
  // The DefiSaver indexer can fall days behind the chain head and returns 404 for any block it
  // hasn't indexed yet, so we ask for its latest indexed snapshot instead of a specific block
  const response = await fetch(`https://stats.defisaver.com/api/automation/tvl/per-asset?chainId=${chainId}&block=latest`);
  const data = await response.json();

  if (response.status !== 200 || !data.balances)
    throw new Error(data.message || 'Error not handled');

  Object.entries(data.balances).forEach(([token, balance]) => {
    api.add(token, +balance)
  })
}

module.exports = {
  doublecounted: true,
  timetravel: false, // the API only serves its latest indexed snapshot
  methodology: 'TVL accounts for all assets deposited into the automated strategies.',
  ethereum: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  base: { tvl: () => ({  }) },
};
