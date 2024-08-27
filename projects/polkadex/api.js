const { ApiPromise, WsProvider } = require("@polkadot/api");
const sdk = require('@defillama/sdk')
const {fetchURL} = require("../helper/utils");

const rpcNodes = ["wss://polkadex.api.onfinality.io/public-ws", "wss://polkadex.public.curie.radiumblock.co/ws"];
const orderbookWallet = "esoEt6uZ3GuFV8EzKB2EAREe3KE9WuRVfmhK1RRtwffY78ArH"

function add(_api, token, bal) {
  _api.add(token, bal, { skipChain: true })
}

async function tvl(_api) {
  const provider = new WsProvider(rpcNodes);
  const api = await ApiPromise.create({ provider, });
  await api.isReady;

  const assetMapping = await getAssetMappings();

  const pdexBalance = await api.query.system.account(orderbookWallet)
  add(_api,'polkadex', pdexBalance.data.free / 1e12)

  let requestedAssets = [];
  Object.keys(assetMapping).forEach(function(key) {
    if(key !== "PDEX")
      requestedAssets.push([key, orderbookWallet]);
  })

  const results = await api.query.assets.account.multi(requestedAssets);

  for(let i = 0; i < results.length; i++)
  {
    if(results[i].toPrimitive() != null) {
      const coingeckoId = assetMapping[requestedAssets[i][0]];
      if(coingeckoId) {
        add(_api, coingeckoId, Number(results[i].toPrimitive().balance) / 1e12)
      }
    }
  }

  return _api.getBalances()
}

async function staking(_api) {
  const provider = new WsProvider(rpcNodes);
  const api = await ApiPromise.create({ provider, });
  await api.isReady

  const chainActiveEra = await api.query.staking.activeEra();

  let activeEra =  JSON.parse(JSON.stringify(chainActiveEra)).index;

  let results = await api.query.staking.erasTotalStake([activeEra]);

  add(_api,'polkadex', results.toPrimitive() / 1e12)

  return _api.getBalances()
}

async function getAssetMappings() {
  let coingeckoMappings = await fetchURL("https://integration-api.polkadex.trade/v1/assets");
  let assetMapping = {};

  if(coingeckoMappings.data === null)
    return assetMapping;

  Object.keys(coingeckoMappings.data).forEach(function(key) {
    assetMapping[coingeckoMappings.data[key].asset_id] = coingeckoMappings.data[key].coingecko_id;
  })

  return assetMapping;
}

module.exports = {
  polkadex: {
    tvl: tvl,
    staking: staking,
  },
}