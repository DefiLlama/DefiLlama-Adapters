const { get } = require('../helper/http');
const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(api) {
  const data = await get('https://plusmain.net/api/defillama/tvl');
  if (data && data.tvl) {
    api.add(ADDRESSES.ethereum.USDT, BigInt(Math.floor(data.tvl)) * BigInt(10 ** 6));
  }
}

async function staking(api) {
  const data = await get('https://plusmain.net/api/defillama/tvl');
  if (data && data.breakdown && data.breakdown.genesis_nodes) {
    api.add(ADDRESSES.ethereum.USDT, BigInt(Math.floor(data.breakdown.genesis_nodes)) * BigInt(10 ** 6));
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Tracks TVL across PLUS Mainnet (Chain ID: 88088) validator staking deposits and DEX liquidity pools via official on-chain indexer API.',
  ethereum: {
    tvl,
    staking
  }
};
