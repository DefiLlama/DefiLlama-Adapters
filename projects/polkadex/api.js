const { ApiPromise, WsProvider } = require("@polkadot/api");
const sdk = require('@defillama/sdk')

const rpcNodes = ["wss://polkadex.api.onfinality.io/public-ws", "wss://polkadex.public.curie.radiumblock.co/ws"];
const orderbookWallet = "esoEt6uZ3GuFV8EzKB2EAREe3KE9WuRVfmhK1RRtwffY78ArH"

const assetMapping = {
  '193492391581201937291053139015355410612': 'pha',
  '182269558229932594457975666948556356791': 'moonbeam',
  '313524628741076911470961827389955394913': 'voucher-dot',
  '130314105136721928300689838359167097187': 'bifrost-native-coin',
  '95930534000017180603917534864279132680': 'polkadot',
  '119367686984583275840673742485354142551': 'dot-is-ded',
  '32595388462891559990827225517299393930': 'unique-network',
  '3496813586714279103986568049643838918': 'tether',
  '222121451965151777636299756141619631150': 'astar',
  '226557799181424065994173367616174607641': 'interbtc',
}

function add(_api, token, bal) {
  _api.add(token, bal, { skipChain: true })
}

async function tvl(_api) {
  const provider = new WsProvider(rpcNodes);
  const api = await ApiPromise.create({ provider, });
  await api.isReady;

  const pdexBalance = await api.query.system.account(orderbookWallet)
  add(_api,'polkadex', pdexBalance.data.free / 1e12)

  let requestedAssets = [];
  Object.keys(assetMapping).forEach(function(key) {
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

module.exports = {
  polkadex: {
    tvl: tvl,
    staking: staking,
  },
}