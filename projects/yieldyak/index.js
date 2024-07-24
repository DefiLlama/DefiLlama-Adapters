const { staking } = require('../helper/staking');
const { cachedGraphQuery, getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk')

const graphUrl = sdk.graph.modifyEndpoint('7oSYYdK5RKmqggdzFyfUnojP6puDAj31C4ezDGrgVfk9')
const graphQuery = `{ farms(first: 1000) { id }}`;

async function tvl(api) {
  const { farms } = await cachedGraphQuery('yieldyak/avax', graphUrl, graphQuery);
  const tokens = await api.multiCall({ 
    abi: 'address:depositToken', 
    calls: farms.map(i => i.id), 
    permitFailure: true, 
  });
  const vals = await api.multiCall({ 
    abi: 'uint256:totalDeposits', 
    calls: farms.map(i => i.id), 
    permitFailure: true, 
  });
  const symbols = await api.multiCall({
    abi: 'string:symbol',
    calls: tokens.map(token => ({ target: token })),
    permitFailure: true,
  });
  
  const excludedAddress = '0x59414b3089ce2af0010e7523dea7e2b35d776ec7';
  const excludedSymbol = 'YAK';

  tokens.forEach((token, i) => {
    if (!token || !vals[i] || token === excludedAddress || symbols[i] === excludedSymbol) return;
    api.add(token, vals[i]);
  });
}

async function arbiTvl(api) {
  const farms = await getConfig('yieldyak/arbi', 'https://staging-api.yieldyak.com/42161/farms')
  const tokens = await api.multiCall({ abi: 'address:depositToken', calls: farms.map(i => i.address), permitFailure: true, })
  const vals = await api.multiCall({ abi: 'uint256:totalDeposits', calls: farms.map(i => i.address), permitFailure: true, })
  const excludedAddress = '0x7f4dB37D7bEb31F445307782Bc3Da0F18dF13696';

  tokens.forEach((token, i) => {
    if (!token || !vals[i] || token === excludedAddress) return;
    api.add(token, vals[i]);
  });
}
async function mantleTvl(api) {
  const farms = await getConfig('yieldyak/mantle', 'https://staging-api.yieldyak.com/5000/farms')
  const tokens = await api.multiCall({ abi: 'address:depositToken', calls: farms.map(i => i.address), permitFailure: true, })
  const vals = await api.multiCall({ abi: 'uint256:totalDeposits', calls: farms.map(i => i.address), permitFailure: true, })
  const excludedAddress = '0x7f4dB37D7bEb31F445307782Bc3Da0F18dF13696';

  tokens.forEach((token, i) => {
    if (!token || !vals[i] || token === excludedAddress) return;
    api.add(token, vals[i]);
  });
}

const masterYak = "0x0cf605484A512d3F3435fed77AB5ddC0525Daf5f"
const yakToken = "0x59414b3089ce2af0010e7523dea7e2b35d776ec7"

module.exports = {
  avax: {
    tvl,
    staking: staking(masterYak, yakToken),
  },
  arbitrum: { tvl: arbiTvl },
  mantle: { tvl: mantleTvl}
}