// Block time varies per chain (10k blocks is ~42min on arbitrum but ~33h on ethereum),
// so we look back a fixed ~30min instead
const BLOCK_TIME = { ethereum: 12, arbitrum: 0.25, optimism: 2 }; // seconds/block
// The DefiSaver indexer occasionally falls hours behind the chain head and returns 404
// for any block it hasn't indexed yet, so we step back progressively before giving up
const LOOKBACKS_SECONDS = [1800, 3600, 6 * 3600, 24 * 3600];

async function tvl(api) {
  const block = await api.getBlock();
  const chainId = api.chainId;

  // Endpoint returns data calculated by these two packages:
  //
  // 1. https://github.com/defisaver/automation-sdk
  // 2. https://github.com/defisaver/defisaver-positions-sdk/
  //
  // By getting subscription data from the first package you can calculate balances for each position using `get${protocol_name_here}AccountBalances` method from the second package

  let data
  for (const lookback of LOOKBACKS_SECONDS) {
    const queryBlock = block - Math.floor(lookback / (BLOCK_TIME[api.chain] ?? 12));
    const response = await fetch(`https://stats.defisaver.com/api/automation/tvl/per-asset?chainId=${chainId}&block=${queryBlock}`);
    data = await response.json();

    if (response.status === 200) break
    if (response.status !== 404)
      throw new Error(data.message || 'Error not handled');
    data = undefined
  }

  if (!data)
    throw new Error(`No indexed data found for the last ${LOOKBACKS_SECONDS.at(-1) / 3600}h`);

  Object.entries(data.balances).forEach(([token, balance]) => {
    api.add(token, +balance)
  })
}

module.exports = {
  doublecounted: true,
  timetravel: false, // because we do latest block - 30 minutes, remove that to refill
  methodology: 'TVL accounts for all assets deposited into the automated strategies.',
  ethereum: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  base: { tvl: () => ({  }) },
};
