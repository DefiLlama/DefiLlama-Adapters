const { nibiru } = require('../helper/coreAssets');
const { getBalance2 } = require('../helper/chain/cosmos')

const contractAddrs = {
  perp: 'nibi1ntmw2dfvd0qnw5fnwdu9pev2hsnqfdj9ny9n0nzh2a5u8v0scflq930mph',
  vaultUsdc: 'nibi193m2a00pmdsvkcvugrfewqzhtq6k0srkjzvxp2sk357vlpspx5vqxu8d7p',
  vaultStnibi: 'nibi1mrplvu3scplnrgns96kg0j8pk3l2p9c7eaz0qdedx0kt3vmcujyqrjkfej',
};

// Wasm precompile address on Nibiru
const WASM_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000000802';

async function tvl(api) {
  // Query both vaults in parallel using multiCall
  const vaultQueries = [
    { contract: contractAddrs.vaultUsdc, asset: nibiru.USDC, name: 'USDC vault' },
    { contract: contractAddrs.vaultStnibi, asset: nibiru["stNIBI"], name: 'stNIBI vault' }
  ];

  const queryMsg = { tvl: {} };
  const queryBytes = vaultQueries.map(() =>
    Buffer.from(JSON.stringify(queryMsg), 'utf8')
  );

  const calls = queryBytes.map((bytes, i) => ({
    target: WASM_PRECOMPILE_ADDRESS,
    params: [vaultQueries[i].contract, bytes]
  }));

  const results = await api.multiCall({
    abi: 'function query(string contractAddr, bytes req) view returns (bytes)',
    calls: calls,
    permitFailure: true
  });

  // Process results
  results.forEach((result, i) => {
    const { asset } = vaultQueries[i];

    if (result && result !== '0x' && result.length > 2) {
      const hexBuffer = Buffer.from(result.slice(2), 'hex');
      const tvlData = JSON.parse(hexBuffer.toString('utf8'));

      if (tvlData) {
        api.add(asset, tvlData);
      }
    }
  });

  // Perp Balances
  const tokensToFetch = [
    { key: "erc20/0x0829F361A05D993d5CEb035cA6DF3446b060970b", symbol: nibiru.USDC },
    { key: "tf/nibi1udqqx30cw8nwjxtl4l28ym9hhrp933zlq8dqxfjzcdhvl8y24zcqpzmh8m/ampNIBI", symbol: nibiru.stNIBI },
  ];
  const relevantTokens = tokensToFetch.map(t => t.key);
  const balancesPerp = await getBalance2({
    owner: contractAddrs.perp,
    tokens: relevantTokens,
    chain: api.chain,
  });
  tokensToFetch.forEach(({ key, symbol }) => {
    const normalizedKey = key.replaceAll("/", ":");
    api.add(symbol, balancesPerp[normalizedKey]);
  })

}

module.exports = {
  nibiru: { tvl },
};
