const { getLogs2 } = require('../helper/cache/getLogs');

// https://chainscan.0g.ai/address/0xaabd31f24914b48daea998e69683225e289d08b0
const manager = '0xaabd31f24914b48daea998e69683225e289d08b0';
// https://chainscan.0g.ai/address/0x5809c1ff809cfc6fca8518016cdffa8339ba2a3a
const vault = '0x5809c1ff809cfc6fca8518016cdffa8339ba2a3a';
const fromBlock = 45552804;

async function tvl(api) {
  const block = await api.getBlock();
  if (block < fromBlock) return;

  const pools = await getLogs2({
    api,
    target: manager,
    fromBlock,
    toBlock: block,
    // Use the SDK cache because the helper cache omits logs from the requested final block.
    skipCache: true,
    eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
  });
  const tokens = [...new Set(pools.flatMap(({ currency0, currency1 }) => [currency0.toLowerCase(), currency1.toLowerCase()]))];
  if (!tokens.length) return;

  const reserves = await api.multiCall({
    target: vault,
    abi: 'function reservesOfApp(address,address) view returns (uint256)',
    calls: tokens.map(token => ({ params: [manager, token] })),
  });
  const protocolFees = await api.multiCall({
    target: manager,
    abi: 'function protocolFeesAccrued(address) view returns (uint256)',
    calls: tokens.map(token => ({ params: [token] })),
  });
  const balances = tokens.map((token, i) => {
    const balance = BigInt(reserves[i]) - BigInt(protocolFees[i]);
    if (balance < 0n) throw new Error(`Protocol fees exceed manager reserves for ${token}`);
    return balance.toString();
  });
  api.addTokens(tokens, balances);
}

module.exports = {
  start: 1790588777,
  methodology: 'Counts liquidity reserves owned by the production Infinity pool manager, including uncollected liquidity-provider fees, excluding uncollected protocol fees and separate Vault credits held by fee recipients or other accounts.',
  '0g': { tvl },
};
