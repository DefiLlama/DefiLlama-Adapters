async function tvl(api) {
  const block = await api.getBlock();
  const chainId = api.chainId;

  // Endpoint returns data calculated by these two packages:
  //
  // 1. https://github.com/defisaver/automation-sdk
  // 2. https://github.com/defisaver/defisaver-positions-sdk/
  //
  // By getting subscription data from the first package you can calculate balances for each position using `get${protocol_name_here}AccountBalances` method from the second package

  const response = await fetch(`https://stats.defisaver.com/api/automation/tvl/per-asset?chainId=${chainId}&block=${block - 10000}`);
  const data = await response.json();

  if (response.status !== 200)
    throw new Error(data.message || 'Error not handled');

  Object.entries(data.balances).forEach(([token, balance]) => {
    api.add(token, +balance)
  })
}

module.exports = {
  doublecounted: true,
  timetravel: false, // because we do block - 10k, remove that to refill
  methodology: 'TVL accounts for all assets deposited into the automated strategies.',
  ethereum: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  base: { tvl },
};
