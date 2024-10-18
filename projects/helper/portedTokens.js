const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const {
  normalizeAddress,
  getCoreAssets,
  stripTokenHeader,
  transformTokens,
  fixBalancesTokens,
  ibcChains,
} = require('./tokenMapping')

async function transformInjectiveAddress() {
  return addr => {
    if (addr.startsWith('ibc:')) return addr
    if (addr.includes('ibc/')) return addr.replace(/.*ibc\//, 'ibc/').replace(/\//g, ':')
    addr = addr.replace(/\//g, ':')
    if (addr.startsWith('peggy0x'))
      return `ethereum:${addr.replace('peggy', '')}`
    if (addr.startsWith('injective:') || addr.startsWith('ethereum:')) return addr
    return `injective:${addr}`;
  };
}

function fixBalances(balances, mapping, { chain, } = {}) {
  const removeUnmapped = false

  Object.keys(balances).forEach(token => {
    let tokenKey = stripTokenHeader(token, chain)
    tokenKey = normalizeAddress(tokenKey, chain)
    const { coingeckoId, decimals } = mapping[tokenKey] || {};
    if (!coingeckoId) {
      if (removeUnmapped && (tokenKey.startsWith('0x') || token.startsWith(chain + ':'))) {
        sdk.log(`Removing token from balances, it is not part of whitelist: ${tokenKey}`);
        delete balances[token];
      }
      return;
    }
    const currentBalance = balances[token];
    delete balances[token];
    sdk.util.sumSingleBalance(
      balances,
      coingeckoId,
      +BigNumber(currentBalance).shiftedBy(-1 * decimals)
    );
  });

  return balances;
}

async function getFixBalances(chain) {
  return getFixBalancesSync(chain)
}

function getFixBalancesSync(chain) {
  const dummyFn = i => i;
  return fixBalancesMapping[chain] || dummyFn;
}

const fixBalancesMapping = {};

for (const chain of Object.keys(fixBalancesTokens)) {
  if (!fixBalancesMapping[chain])
    fixBalancesMapping[chain] = b => fixBalances(b, fixBalancesTokens[chain], { chain })
}

const chainTransforms = {
  injective: transformInjectiveAddress,
};

function transformChainAddress(
  mapping = {},
  chain,
  { skipUnmapped = false, chainName = "" } = {}
) {

  return addr => {
    if (['solana'].includes(chain)) {
      return mapping[addr] ? mapping[addr] : `${chain}:${addr}`
    }
    if (!addr.startsWith('0x')) return addr
    addr = addr.toLowerCase();
    if (!mapping[addr] && skipUnmapped) {
      sdk.log("Mapping for addr %s not found in chain %s, returning garbage address", addr, chain);
      return "0x1000000000000000000000000000000000000001";
    }
    if (chain === 'ethereum') return mapping[addr] ? mapping[addr] : addr
    return mapping[addr] || `${chain}:${addr}`;
  };
}

async function getChainTransform(chain) {
  if (chainTransforms[chain])
    return chainTransforms[chain]()

  if (transformTokens[chain])
    return transformChainAddress(transformTokens[chain], chain)

  return addr => {
    if (addr.includes('ibc/')) return addr.replace(/.*ibc\//, 'ibc/').replace(/\//g, ':')
    if (addr.startsWith('coingecko:')) return addr
    if (addr.startsWith(chain + ':') || addr.startsWith('ibc:')) return addr

    addr = normalizeAddress(addr, chain).replace(/\//g, ':')
    const chainStr = `${chain}:${addr}`
    if ([...ibcChains, 'ton', 'mvc', 'defichain', 'waves'].includes(chain)) return chainStr
    if (chain === 'cardano' && addr === 'ADA') return 'coingecko:cardano'
    if (chain === 'near' && addr.endsWith('.near')) return chainStr
    if (chain === 'aeternity' && addr.startsWith('ct_')) return chainStr
    if (chain === 'tron' && addr.startsWith('T')) return chainStr
    if (chain === 'stacks' && addr.startsWith('SP')) return chainStr
    if (chain === 'tezos' && addr.startsWith('KT1')) return chainStr
    if (chain === 'terra2' && addr.startsWith('terra1')) return chainStr
    if (chain === 'aura' && addr.startsWith('aura')) return chainStr
    if (chain === 'massa' && addr.startsWith('AS1')) return chainStr
    if (chain === 'algorand' && /^\d+$/.test(addr)) return chainStr
    if (addr.startsWith('0x') || ['solana', 'kava', 'renec'].includes(chain)) return chainStr
    return addr
  };
}

async function transformBalances(chain, balances) {
  const transform = await getChainTransform(chain)
  const fixBalances = await getFixBalances(chain)
  Object.entries(balances).forEach(([token, value]) => {
    delete balances[token]
    sdk.util.sumSingleBalance(balances, transform(token), value)
  })
  fixBalances(balances)
  return balances
}

async function transformDexBalances({ api, chain, data, balances, restrictTokenRatio = 5, withMetadata = false, blacklistedTokens = [], coreTokens }) {

  if (api) {
    balances = api.getBalances()
    chain = api.chain
  } else if (!balances) balances = {}
  if (!coreTokens)
    coreTokens = new Set(getCoreAssets(chain))

  blacklistedTokens.forEach(i => coreTokens.delete(i))

  const prices = {}
  data.forEach(i => {
    i.token0 = normalizeAddress(i.token0, chain)
    i.token1 = normalizeAddress(i.token1, chain)
    i.token0Bal = +i.token0Bal
    i.token1Bal = +i.token1Bal
    priceToken(i)
  })
  // sdk.log(prices) 
  data.forEach(addTokens)
  updateBalances(balances)

  blacklistedTokens.forEach(i => delete balances[i])

  if (!withMetadata)
    return transformBalances(chain, balances)
  return {
    prices,
    updateBalances,
    balances: await transformBalances(chain, balances),
  }

  function addTokens({ token0, token0Bal, token1, token1Bal }) {
    const isCoreToken0 = coreTokens.has(token0.replace('ibc/', ''))
    const isCoreToken1 = coreTokens.has(token1.replace('ibc/', ''))
    if ((isCoreToken0 && isCoreToken1) || (!isCoreToken0 && !isCoreToken1)) {
      sdk.util.sumSingleBalance(balances, token0, token0Bal)
      sdk.util.sumSingleBalance(balances, token1, token1Bal)
    } else if (isCoreToken0) {
      sdk.util.sumSingleBalance(balances, token0, token0Bal * 2)
    } else {
      sdk.util.sumSingleBalance(balances, token1, token1Bal * 2)
    }
  }

  function updateBalances(balances) {
    Object.entries(balances).forEach(([token]) => {
      let bal = +balances[token] // this is safer as token balance might change while looping when two entries for same token exist
      const tokenKey = normalizeAddress(token, chain)
      if (!prices[tokenKey]) return;
      const priceObj = prices[tokenKey]
      const { coreToken, price } = priceObj
      delete balances[token]
      if (bal > priceObj.convertableTokenAmount) {
        const unconverted = bal - priceObj.convertableTokenAmount
        const convertible = priceObj.convertableTokenAmount
        priceObj.convertableTokenAmount = 0
        sdk.util.sumSingleBalance(balances, tokenKey, unconverted)
        sdk.util.sumSingleBalance(balances, coreToken, convertible * price)
        return
      }

      priceObj.convertableTokenAmount -= bal
      sdk.util.sumSingleBalance(balances, coreToken, bal * price)
    })
  }

  function priceToken({ token0, token0Bal, token1, token1Bal }) {
    const isCoreToken0 = coreTokens.has(token0)
    const isCoreToken1 = coreTokens.has(token1)
    if (isCoreToken0 && isCoreToken1) return;
    if (!isCoreToken0 && !isCoreToken1) return;
    if (isCoreToken0) setPrice(token1, token1Bal, token0, token0Bal)
    else setPrice(token0, token0Bal, token1, token1Bal)
  }

  function setPrice(token, tokenBal, coreToken, coreTokenBal) {
    if (+tokenBal === 0 || +coreTokenBal === 0) return;
    if (!prices[token]) {
      prices[token] = {
        coreToken,
        coreTokenBal,
        tokensInCorePool: tokenBal,
        convertableTokenAmount: tokenBal * restrictTokenRatio,
        price: coreTokenBal / tokenBal
      }
      return;
    }

    const priceObj = prices[token]
    priceObj.convertableTokenAmount += tokenBal * restrictTokenRatio
    if (tokenBal > priceObj.tokensInCorePool) { // i.e current pool has more liquidity
      priceObj.tokensInCorePool = tokenBal
      priceObj.coreToken = coreToken
      priceObj.coreTokenBal = coreTokenBal
      priceObj.price = coreTokenBal / tokenBal
    }
  }
}

module.exports = {
  getChainTransform,
  getFixBalances,
  stripTokenHeader,
  getFixBalancesSync,
  transformBalances,
  transformDexBalances,
};
