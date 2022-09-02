

const { ApiPromise, WsProvider } = require("@polkadot/api")
const { Wallet } = require("@acala-network/sdk/wallet")
const { FixedPointNumber, forceToCurrencyName } = require("@acala-network/sdk-core");
const { options } = require("@acala-network/api")
const sdk = require('@defillama/sdk')

const api = {}

const providers = {
  karura: [
    // Taken from https://wiki.acala.network/integrate/integration-1/networks
    "wss://karura.api.onfinality.io/public-ws",
    "wss://pub.elara.patract.io/karura",
    "wss://karura-rpc-0.aca-api.network",
    "wss://karura-rpc-1.aca-api.network",
    "wss://karura-rpc-2.aca-api.network/ws",
    "wss://karura-rpc-3.aca-api.network/ws",
  ],
  polkadot: [
    "wss://polkadot-rpc.dwellir.com",
    "wss://polkadot.api.onfinality.io/public-ws",
    "wss://rpc.polkadot.io",
  ],
  kusama: [
    "wss://kusama-rpc.polkadot.io",
    "wss://kusama.api.onfinality.io/public-ws",
    "wss://kusama-rpc.dwellir.com",
  ],
  acala: [
    "wss://acala-polkadot.api.onfinality.io/public-ws",
    "wss://acala-rpc-0.aca-api.network",
    "wss://acala-rpc-1.aca-api.network",
    "wss://acala-rpc-2.aca-api.network/ws",
    "wss://acala-rpc-3.aca-api.network/ws",
    "wss://acala.polkawallet.io",
  ],
  heiko: [
    "wss://heiko-rpc.parallel.fi",
    "wss://parallel-heiko.api.onfinality.io/public-ws",
  ],
  parallel: [
    "wss://rpc.parallel.fi",
    "wss://parallel.api.onfinality.io/public-ws",
  ],
  kintsugi: [
    "wss://api-kusama.interlay.io/parachain"
  ],
  interlay: [
    "wss://api.interlay.io:443/parachain"
  ],
}

async function getAPI(chain) {
  if (!api[chain]) {
    const provider = new WsProvider(providers[chain]);
    api[chain] = ApiPromise.create(options({ provider }))
  }

  await api[chain].isReady
  return api[chain]
}

async function getWallet(chain) {
  const api = await getAPI(chain)
  const wallet = new Wallet(api, {
    supportAUSD: true,
  })

  await wallet.isReady
  return wallet
}

const fixMapping = {
  parallel: {
    101: { geckoId: 'polkadot', decimals: 10, },
    108: { geckoId: 'acala', decimals: 12, },
    104: { geckoId: 'acala-dollar-disabled', decimals: 12, },
    114: { geckoId: 'moonbeam', decimals: 18, },
  },
  heiko: {
    113: { geckoId: 'moonriver', decimals: 18, },
    100: { geckoId: 'kusama', decimals: 12, },
    103: { geckoId: 'acala-dollar-disabled', decimals: 12, },
    102: { geckoId: 'tether', decimals: 6, },
    107: { geckoId: 'karura', decimals: 12, },
    119: { geckoId: 'kintsugi', decimals: 12, },
    121: { geckoId: 'kintsugi-btc', decimals: 8, },
    123: { geckoId: 'genshiro', decimals: 9, },

  }
}

async function getTokenPrices({ api, chain = '' }) {

  const metadatas = await api.query.assets.metadata.entries();
  const assets = await api.query.assets.asset.entries();
  const relayAssetId = (await api.consts.crowdloans.relayCurrency).toNumber();
  const nativeAssetId = (await api.consts.currencyAdapter.getNativeCurrencyId).toNumber();
  const allAssets = metadatas.map(([{ args }, metadata]) => {
    const [assetId] = args;
    const { symbol, decimals } = metadata;
    return {
      assetId: assetId.toNumber(),
      symbol: symbol.toHuman().toString(),
      decimals: decimals.toNumber()
    };
  })
  allAssets.push({
    assetId: nativeAssetId,
    symbol: nativeAssetId === 0 ? 'HKO' : 'PARA', // hard code, cuz rpc is not available in subquery
    decimals: 12
  })

  const totalSupplies = {}
  assets.map(([{ args }, asset]) => {
    const [assetId] = args;
    totalSupplies[assetId] = +asset.toJSON().supply
  })

  const lpTokens = allAssets?.filter(asset => asset.symbol.startsWith('LP-')) || [];
  const lpTokenMappings = lpTokens
    .map(token => {
      const symbols = token.symbol.replace('LP-', '').split(/\/(.*)/s);
      const assets = symbols.map(symbol => allAssets.find(asset => asset.symbol === symbol));
      const relayAsset = assets.find(asset => asset?.assetId === relayAssetId);
      const otherAsset = assets.find(asset => asset?.assetId !== relayAssetId);
      return (
        relayAsset &&
        otherAsset && {
          token,
          relayAsset,
          otherAsset
        }
      );
    })
    .filter(i => i);



  const lpTokenPools = (await api.query.amm.pools.multi(
    lpTokenMappings.map(mapping => [mapping.relayAsset.assetId, mapping.otherAsset.assetId])
  )).map(i => i.toJSON())

  const lpTokenPoolsReverse = (await api.query.amm.pools.multi(
    lpTokenMappings.map(mapping => [mapping.otherAsset.assetId, mapping.relayAsset.assetId])
  )).map(i => i.toJSON())

  let total = 0
  const prices = {}
  lpTokenPools.forEach((data, i) => {
    if (data) {
      total += +data.baseAmount * 2
      prices[lpTokenMappings[i].otherAsset.assetId] = data.baseAmount / data.quoteAmount
      prices[lpTokenMappings[i].relayAsset.assetId] = 1
      prices[lpTokenMappings[i].token.assetId] = data.baseAmount * 2 / totalSupplies[lpTokenMappings[i].token.assetId]
    }
    else {
      total += +lpTokenPoolsReverse[i].quoteAmount * 2
      prices[lpTokenMappings[i].relayAsset.assetId] = 1
      prices[lpTokenMappings[i].otherAsset.assetId] = lpTokenPoolsReverse[i].quoteAmount / lpTokenPoolsReverse[i].baseAmount
      prices[lpTokenMappings[i].token.assetId] = lpTokenPoolsReverse[i].quoteAmount * 2 / totalSupplies[lpTokenMappings[i].token.assetId]
    }
  })

  const baseToken = nativeAssetId === 0 ? 'kusama' : 'polkadot'
  const baseDecimals = nativeAssetId === 0 ? 12 : 10

  function updateBalances(balances) {
    const polkadotPrice = nativeAssetId === 0 ? 62 : 9.48
    allAssets.forEach(a => {
      a.price = prices[a.assetId] || 0
      // a.totalSupply = (totalSupplies[a.assetId] || 0) / ( 10 ** a.decimals)
      a.balance = (balances[a.assetId] || 0) / (10 ** a.decimals)
      a.balanceDOT = polkadotPrice * (balances[a.assetId] || 0) * a.price / ((10 ** baseDecimals) * 1e6)
      // a.allUSD= polkadotPrice * (totalSupplies[a.assetId] || 0)  * a.price / ((10 **baseDecimals) * 1e6)
    })
    // console.table(allAssets)
    const geckoMapping = fixMapping[chain]

    Object.keys(balances).forEach(token => {
      if (geckoMapping && geckoMapping[token]) {
        const { decimals, geckoId, } = geckoMapping[token]
        sdk.util.sumSingleBalance(balances, geckoId, balances[token] / 10 ** decimals)
        delete balances[token]
        return;
      }

      if (!prices[token]) return;
      // console.log(token, baseToken, prices[token] * balances[token] / (10 ** baseDecimals) /1e6, (balances[baseToken] || 0) /1e6)
      sdk.util.sumSingleBalance(balances, baseToken, prices[token] * balances[token] / (10 ** baseDecimals))
      // console.log(balances[baseToken])
      delete balances[token]
    })
    return balances
  }

  return {
    updateBalances, balances: {
      [baseToken]: total / (10 ** baseDecimals)
    }, prices,
  }
}

const geckoMappings = {
  acala: {
    token: {
      ACA: 'acala',
      DOT: 'polkadot',
      AUSD: 'acala-dollar-disabled',
      LDOT: 'liquid-staking-dot',
    },
    liquidCrowdloan: {
      13: 'liquid-crowdloan-dot',
    }
  },
  karura: {
    token: {
      KSM: 'kusama',
      LKSM: 'liquid-ksm',
      KAR: 'karura',
      BNC: 'bifrost-native-coin',
      KINT: 'kintsugi',
      KBTC: 'kintsugi-btc',
    },
    liquidCrowdloan: {
    }
  },
}

async function addTokenBalance({ balances, amount, chain, tokenArg, api, wallet, }) {
  if (!api) api = await getAPI(chain)
  if (!wallet) wallet = await getWallet(chain)
  const geckoMapping = geckoMappings[chain]
  const tokenJson = tokenArg.toJSON()
  const tokenStr = tokenArg.toString()
  // console.log(tokenJson, tokenStr)
  const token = await wallet.getToken(forceToCurrencyName(tokenArg));
  amount = FixedPointNumber.fromInner(amount.toString(), token.decimals)

  if (tokenJson.token && geckoMapping.token[tokenJson.token])
    return sdk.util.sumSingleBalance(balances, geckoMapping.token[tokenJson.token], amount.toNumber())

  if (tokenJson.liquidCrowdloan && geckoMapping.liquidCrowdloan[tokenJson.liquidCrowdloan])
    return sdk.util.sumSingleBalance(balances, geckoMapping.liquidCrowdloan[tokenJson.liquidCrowdloan], amount.toNumber())

  if (chain === 'acala' && tokenJson.foreignAsset === 3) return;

  const price = await wallet.getPrice(token)
  if (price)
    sdk.util.sumSingleBalance(balances, 'tether', amount.times(price).toNumber())
}

module.exports = {
  getAPI,
  getWallet,
  getTokenPrices,
  addTokenBalance,
}
