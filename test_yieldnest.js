const { getApi } = require('@defillama/sdk');
const yieldnest = require('./projects/yieldnest/index.js');

async function test() {
  const api = await getApi('bsc', 12345678); // dummy timestamp
  try {
    const result = await yieldnest.bsc.tvl(api);
    console.log('TVL result:', result);
    console.log('Balances:', api.getBalances());
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
