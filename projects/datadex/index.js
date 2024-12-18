const sdk = require('@defillama/sdk');
const { getLogs } = require('../helper/cache/getLogs');

const FACTORY = '0xc2a0d530e57B1275fbce908031DA636f95EA1E38';
const START_BLOCK = 763744;
// The event signature for: PoolCreated(address token0, address token1, uint24 fee, int24 tickSpacing, address pool)
const POOL_CREATED_TOPIC = '0x783cca1c0412dd0d695e784568c7d50e9ece4dbb7f3638a34b2b3e7d8f1b7cf0';

async function transformVanaAddress() {
  const mapping = {
    'vana:0x00eddd9621fb08436d0331c149d1690909a5906d': 'coingecko:vana',
    'vana:0xf1815bd50389c46847f0bda824ec8da914045d14': 'coingecko:usd-coin'
  };

  return (address) => {
    address = address.toLowerCase();
    return mapping[`vana:${address}`] || `vana:${address}`;
  }
}

async function vanaTvl(api) {
  const block = api.block;
  const chain = 'vana';

  // Fetch PoolCreated logs from the factory contract
  const logs = await getLogs({
    api,
    target: FACTORY,
    fromBlock: START_BLOCK,
    toBlock: block,
    topic: POOL_CREATED_TOPIC,
    keys: [],
    chain,
  });

  const pairAddresses = [];
  const token0Addresses = [];
  const token1Addresses = [];

  for (let log of logs) {
    token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase());
    token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase());
    pairAddresses.push(`0x${log.data.substr(-40)}`.toLowerCase());
  }

  let balanceCalls = [];

  for (let i = 0; i < pairAddresses.length; i++) {
    balanceCalls.push({ target: token0Addresses[i], params: pairAddresses[i] });
    balanceCalls.push({ target: token1Addresses[i], params: pairAddresses[i] });
  }

  // Fetch token balances in the pools
  const tokenBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: balanceCalls,
    chain,
    block,
  });

  let balances = {};

  // Sum the balances as BigInts
  tokenBalances.output.forEach((result) => {
    if (result.success) {
      const token = result.input.target.toLowerCase();
      const balance = BigInt(result.output);

      if (balance > 0n) {
        const key = `vana:${token}`;
        if (!balances[key]) {
          balances[key] = balance;
        } else {
          balances[key] += balance;
        }
      }
    }
  });

  // Convert BigInt balances to strings
  const formattedBalances = {};
  for (const [key, value] of Object.entries(balances)) {
    formattedBalances[key] = value.toString();
  }

  // Manually apply the transformation (no transformBalances)
  const transform = await transformVanaAddress();
  const finalBalances = {};
  for (const [key, val] of Object.entries(formattedBalances)) {
    // Remove 'vana:' prefix before calling transform
    const tokenAddress = key.replace('vana:', '');
    const transformedKey = transform(tokenAddress);
    finalBalances[transformedKey] = val;
  }

  const decimalsMap = {
    'coingecko:vana': 18,      // Replace with actual decimals if different
    'coingecko:usd-coin': 6,
  };
  
  for (const [token, balanceStr] of Object.entries(finalBalances)) {
    const decimals = decimalsMap[token] || 18; // default to 18 if unknown
    // Convert string to BigInt
    const balanceBigInt = BigInt(balanceStr);
    const divisor = 10n ** BigInt(decimals);
    // Divide to get the human-readable amount as a BigInt
    const humanReadableBalance = balanceBigInt / divisor;
    // Convert back to string
    finalBalances[token] = humanReadableBalance.toString();
  }

  console.log('Final Balances with Coingecko IDs:', finalBalances);

  return finalBalances;
}

module.exports = {
  vana: {
    tvl: vanaTvl,
  },
};
