// projects/proptech/index.js
const sdk = require('@defillama/sdk');

const GENESIS_ADDRESS = '0x243AC97f37040A7f64a11B84c818cE222A8d3ab7';

async function tvl(timestamp, block, chainBlocks, { api }) {
  // Get native token balance from genesis address
  const balance = await sdk.api.eth.getBalance({
    target: GENESIS_ADDRESS,
    chain: 'proptech',
    block: chainBlocks?.proptech,
  });

  // Add to TVL with CoinGecko ID
  api.addCGToken('proptech', balance.output);
  
  return api.getBalances();
}

module.exports = {
  methodology: 'PTEK native token held in genesis miner address (0x243AC97f37040A7f64a11B84c818cE222A8d3ab7). This address received 21M PTEK at genesis and represents the chain\'s initial token distribution.',
  start: 0,
  proptech: { tvl }
};