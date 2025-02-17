const { staking } = require('../helper/staking');
const { cachedGraphQuery, getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk')

const graphUrl = sdk.graph.modifyEndpoint('7oSYYdK5RKmqggdzFyfUnojP6puDAj31C4ezDGrgVfk9')
const graphQuery = `{ farms(first: 1000) { id }}`;

async function avaxTvl(api) {
  const farms = await getConfig('yieldyak/avax', 'https://staging-api.yieldyak.com/43114/farms')
  const tokens = await api.multiCall({ abi: 'address:depositToken', calls: farms.map(i => i.address), permitFailure: true, })
  const vals = await api.multiCall({ abi: 'uint256:totalDeposits', calls: farms.map(i => i.address), permitFailure: true, })
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
const arbiYyStaking = "0xbb82b43Bf2057B804253D5Db8c18A647fC1f3403"
const mantleYyStaking = "0xF54D65AeB65b093A6BF717b541894ee6471A6CE1"
const bridgedYakToken = "0x7f4dB37D7bEb31F445307782Bc3Da0F18dF13696"

module.exports = {
  avax: {
    tvl:avaxTvl,
    staking: staking(masterYak, yakToken),
  },
  arbitrum: { 
    tvl: arbiTvl,
    staking: staking(arbiYyStaking, bridgedYakToken),
  },
  mantle: { 
    tvl: mantleTvl,
    staking: staking(mantleYyStaking, bridgedYakToken),
  }
}