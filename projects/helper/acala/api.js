

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
    // 104: { geckoId: 'acala-dollar', decimals: 12, },
    114: { geckoId: 'moonbeam', decimals: 18, },
  },
  heiko: {
    113: { geckoId: 'moonriver', decimals: 18, },
    100: { geckoId: 'kusama', decimals: 12, },
    // 103: { geckoId: 'acala-dollar', decimals: 12, },
    102: { geckoId: 'tether', decimals: 6, },
    107: { geckoId: 'karura', decimals: 12, },
    119: { geckoId: 'kintsugi', decimals: 12, },
    121: { geckoId: 'kintsugi-btc', decimals: 8, },
    123: { geckoId: 'genshiro', decimals: 9, },

  }
}

async function getTokenPrices({ api, chain = '' }) {
  if (!['heiko', 'parallel'].includes(chain)) throw new Error('Chain not supported')

  const geckoMapping = fixMapping[chain]
  const metadatas = await api.query.assets.metadata.entries();
  const assets = await api.query.assets.asset.entries();
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
      const assets = symbols.map(symbol => allAssets.find(asset => asset.symbol === symbol)).slice(0, 2)
      return { token, assets }
    })

  const lpTokenPools = (await api.query.amm.pools.multi(
    lpTokenMappings.map(mapping => mapping.assets.map(i => i.assetId))
  )).map(i => i.toJSON())

  const lpTokenPoolsReverse = (await api.query.amm.pools.multi(
    lpTokenMappings.map(mapping => mapping.assets.map(i => i.assetId).reverse())
  )).map(i => i.toJSON())

  const prices = {}
  const balances = {}
  const coreAssets = Object.keys(geckoMapping)
  lpTokenPools.forEach((data, i) => {
    let mapping = lpTokenMappings[i]
    let lpAssetId = mapping.token.assetId
    let baseAsset = mapping.assets[0].assetId
    let quoteAsset = mapping.assets[1].assetId
    let baseAmount, quoteAmount

    if (data) {
      baseAmount = +data.baseAmount
      quoteAmount = +data.quoteAmount
    } else {
      quoteAmount = +lpTokenPoolsReverse[i].baseAmount
      baseAmount = +lpTokenPoolsReverse[i].quoteAmount
    }

    const coreToken1 = coreAssets.includes('' + baseAsset)
    const coreToken2 = coreAssets.includes('' + quoteAsset)
    if (coreToken1 && coreToken2) {
      prices[lpAssetId] = { ...geckoMapping[baseAsset], price: baseAmount * 2 / totalSupplies[lpAssetId] }
      sdk.util.sumSingleBalance(balances, baseAsset, baseAmount)
      sdk.util.sumSingleBalance(balances, quoteAsset, quoteAmount)
    } else if (coreToken1) {
      prices[lpAssetId] = { ...geckoMapping[baseAsset], price: baseAmount * 2 / totalSupplies[lpAssetId] }
      prices[quoteAsset] = { ...geckoMapping[baseAsset], price: baseAmount / quoteAmount }
      sdk.util.sumSingleBalance(balances, baseAsset, baseAmount * 2)
    } else if (coreToken2) {
      prices[lpAssetId] = { ...geckoMapping[quoteAsset], price: quoteAmount * 2 / totalSupplies[lpAssetId] }
      prices[baseAsset] = { ...geckoMapping[quoteAsset], price: quoteAmount / baseAmount }
      sdk.util.sumSingleBalance(balances, quoteAsset, quoteAmount * 2)
    } else {
      sdk.util.sumSingleBalance(balances, baseAsset, baseAmount)
      sdk.util.sumSingleBalance(balances, quoteAsset, quoteAmount)
    }
  })

  function updateBalances(balances) {
    Object.keys(balances).forEach(token => {
      if (geckoMapping && geckoMapping[token]) {
        const { decimals, geckoId, } = geckoMapping[token]
        sdk.util.sumSingleBalance(balances, geckoId, balances[token] / 10 ** decimals)
        delete balances[token]
        return;
      }

      if (!prices[token]) return;
      const { geckoId, decimals, price } = prices[token]
      sdk.util.sumSingleBalance(balances, geckoId, price * balances[token] / (10 ** decimals))
      delete balances[token]
    })
    return balances
  }

  updateBalances(balances)

  return {
    updateBalances, balances, prices,
  }
}

const geckoMappings = {
  acala: {
    token: {
      ACA: 'acala',
      DOT: 'polkadot',
      // AUSD: 'acala-dollar',
      // LDOT: 'liquid-staking-dot',  // coingecko delisted it
    },
    liquidCrowdloan: {
      // 13: 'liquid-crowdloan-dot',  // coingecko delisted it
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
  const token = await wallet.getToken(forceToCurrencyName(tokenArg));
  amount = FixedPointNumber.fromInner(amount.toString(), token.decimals)

  if (tokenJson.token && geckoMapping.token[tokenJson.token])
    return sdk.util.sumSingleBalance(balances, geckoMapping.token[tokenJson.token], amount.toNumber())

  if (tokenJson.liquidCrowdloan && geckoMapping.liquidCrowdloan[tokenJson.liquidCrowdloan])
    return sdk.util.sumSingleBalance(balances, geckoMapping.liquidCrowdloan[tokenJson.liquidCrowdloan], amount.toNumber())

  if (chain === 'acala' && tokenJson.foreignAsset === 3) return;

  const price = await wallet.getPrice(token)
  if (price) {
    sdk.log('Adding token value in USD (in millions), amount: ', forceToCurrencyName(tokenArg), amount.times(price).toNumber() / 1e6, amount.toNumber()/1e6,)
    sdk.util.sumSingleBalance(balances, 'tether', amount.times(price).toNumber())
  }
}

module.exports = {
  getAPI,
  getWallet,
  getTokenPrices,
  addTokenBalance,
}
