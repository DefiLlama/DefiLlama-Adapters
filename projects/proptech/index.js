// projects/proptech/index.js
const sdk = require('@defillama/sdk');

const GENESIS_ADDRESS = '0x243AC97f37040A7f64a11B84c818cE222A8d3ab7';

async function tvl(timestamp, block, chainBlocks, { api }) {
  // Get native token balance in wei
  const balance = await sdk.api.eth.getBalance({
    target: GENESIS_ADDRESS,
    chain: 'proptech',
    block: chainBlocks?.proptech,
  });

  // Convert from wei to ether units (divide by 10^18)
  const scaledBalance = balance.output / 1e18;
  
  // Add to TVL with CoinGecko ID
  api.addCGToken('proptech', scaledBalance);
  
  return api.getBalances();
}

module.exports = {
  methodology: 'PTEK native token held in genesis miner address (0x243AC97f37040A7f64a11B84c818cE222A8d3ab7). Balance is converted from wei to ether units.',
  start: 0,
  proptech: { tvl }
};