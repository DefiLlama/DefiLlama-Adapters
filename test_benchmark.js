const bima = require('./projects/bima-labs-cdp/index.js');
const sdk = require('@defillama/sdk');

async function run() {
  console.time('tvl');
  const api = new sdk.ChainApi({ chain: 'ethereum' });
  await bima.ethereum.tvl(api);
  console.timeEnd('tvl');
}
run();
