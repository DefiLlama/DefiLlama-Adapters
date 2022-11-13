const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const {
  normalizeAddress,
  getCoreAssets,
  stripTokenHeader,
  transformTokens,
  fixBalancesTokens,
  unsupportedGeckoChains,
  ibcChains,
} = require('./tokenMapping')

async function transformFantomAddress() {
  return transformChainAddress(transformTokens.fantom, "fantom")
}

function compareAddresses(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

async function transformAvaxAddress() {
  const [
    bridgeTokensOld,
    bridgeTokensNew,
    bridgeTokenDetails
  ] = await Promise.all([
    utils.fetchURL(
      "https://raw.githubusercontent.com/0xngmi/bridge-tokens/main/data/penultimate.json"
    ),
    utils
      .fetchURL(
        "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/avalanche_contract_address.json"
      )
      .then(r => Object.entries(r.data)),
    utils.fetchURL(
      "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/token_list.json"
    )
  ]);
  return addr => {
    const map = transformTokens.avax;
    if (map[addr.toLowerCase()]) return map[addr.toLowerCase()]
    const srcToken = bridgeTokensOld.data.find(token =>
      compareAddresses(token["Avalanche Token Address"], addr)
    );
    if (
      srcToken !== undefined &&
      srcToken["Ethereum Token Decimals"] ===
      srcToken["Avalanche Token Decimals"]
    ) {
      return srcToken["Ethereum Token Address"];
    }
    const newBridgeToken = bridgeTokensNew.find(token =>
      compareAddresses(addr, token[1])
    );
    if (newBridgeToken !== undefined) {
      const tokenName = newBridgeToken[0].split(".")[0];
      const tokenData = bridgeTokenDetails.data[tokenName];
      if (tokenData !== undefined) {
        return tokenData.nativeContractAddress;
      }
    }
    return `avax:${addr}`;
  };
}

async function transformBscAddress() {
  return transformChainAddress(transformTokens.bsc, "bsc")
}

async function transformPolygonAddress() {
  return transformChainAddress(transformTokens.polygon, "polygon")
}

async function transformCeloAddress() {
  return transformChainAddress(transformTokens.celo, "celo")
}

async function transformHarmonyAddress() {
  const bridge = (await utils.fetchURL(
    "https://be4.bridge.hmny.io/tokens/?page=0&size=1000"
  )).data.content;

  const mapping = transformTokens.harmony

  return addr => {
    addr = addr.toLowerCase();
    if (mapping[addr]) return mapping[addr];
    const srcToken = bridge.find(token =>
      compareAddresses(addr, token.hrc20Address)
    );
    if (srcToken !== undefined) {
      const prefix = srcToken.network === "BINANCE" ? "bsc:" : "";
      return prefix + srcToken.erc20Address;
    }
    return `harmony:${addr}`;
  };
}

async function transformOptimismAddress() {
  const bridge = (await utils.fetchURL(
    "https://static.optimism.io/optimism.tokenlist.json"
  )).data.tokens;

  const mapping = transformTokens.optimism

  return addr => {
    addr = addr.toLowerCase();

    if (mapping[addr]) return mapping[addr];

    const dstToken = bridge.find(
      token => compareAddresses(addr, token.address) && token.chainId === 10
    );
    if (dstToken !== undefined) {
      const srcToken = bridge.find(
        token => dstToken.logoURI === token.logoURI && token.chainId === 1
      );
      if (srcToken !== undefined) {
        return srcToken.address;
      }
    }
    return `optimism:${addr}`;
  };
}

async function transformArbitrumAddress() {
  const bridge = (await utils.fetchURL(
    "https://bridge.arbitrum.io/token-list-42161.json"
  )).data.tokens;
  const mapping = transformTokens.arbitrum

  return addr => {
    addr = addr.toLowerCase();
    if (mapping[addr]) return mapping[addr];
    const dstToken = bridge.find(token =>
      compareAddresses(addr, token.address)
    );
    if (dstToken && dstToken.extensions) {
      return dstToken.extensions.bridgeInfo[1].tokenAddress;
    }
    return `arbitrum:${addr}`;
  };
}

async function transformInjectiveAddress() {
  return addr => {
    if (addr.startsWith('peggy0x'))
      return `ethereum:${addr.replace('peggy', '')}`
    return `injective:${addr}`;
  };
}

function fixBalances(balances, mapping, { chain, } = {}) {
  const removeUnmapped = unsupportedGeckoChains.includes(chain)

  Object.keys(balances).forEach(token => {
    let tokenKey = stripTokenHeader(token, chain)
    tokenKey = normalizeAddress(tokenKey, chain)
    const { coingeckoId, decimals } = mapping[tokenKey] || {};
    if (!coingeckoId) {
      if (removeUnmapped && (tokenKey.startsWith('0x') || token.startsWith(chain + ':'))) {
        console.log(
          `Removing token from balances, it is not part of whitelist: ${tokenKey}`
        );
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
  fantom: transformFantomAddress,
  bsc: transformBscAddress,
  polygon: transformPolygonAddress,
  avax: transformAvaxAddress,
  harmony: transformHarmonyAddress,
  optimism: transformOptimismAddress,
  arbitrum: transformArbitrumAddress,
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
      console.log(
        "Mapping for addr %s not found in chain %s, returning garbage address",
        addr,
        chain
      );
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
    addr = normalizeAddress(addr, chain)
    const chainStr = `${chain}:${addr}`
    if (chain === 'near' && addr.endsWith('.near')) return chainStr
    if (chain === 'tezos' && addr.startsWith('KT1')) return chainStr
    if (ibcChains.includes(chain) && addr.startsWith('ibc/')) return chainStr
    if (chain === 'terra2' && addr.startsWith('terra1')) return chainStr
    if (chain === 'algorand' && /^\d+$/.test(addr)) return chainStr
    if (addr.startsWith('0x') || ['solana'].includes(chain)) return chainStr
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

async function transformDexBalances({ chain, data, balances = {}, restrictTokenRatio = 10, withMetadata = false, blacklistedTokens = [], coreTokens}) {

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
    const isCoreToken0 = coreTokens.has(token0)
    const isCoreToken1 = coreTokens.has(token1)
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
    Object.entries(balances).forEach(([token, bal]) => {
      bal = +bal
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
        convertableTokenAmount: coreTokenBal * restrictTokenRatio,
        price: coreTokenBal / tokenBal
      }
      return;
    }

    const priceObj = prices[token]
    priceObj.convertableTokenAmount += coreTokenBal * restrictTokenRatio
    if (tokenBal > priceObj.tokensInCorePool) { // i.e current pool has more liquidity
      priceObj.tokensInCorePool = coreTokenBal
      priceObj.coreToken = coreToken
      priceObj.coreTokenBal = coreTokenBal
      priceObj.price = coreTokenBal / tokenBal
    }
  }
}

module.exports = {
  getChainTransform,
  getFixBalances,
  transformFantomAddress,
  transformBscAddress,
  transformPolygonAddress,
  transformAvaxAddress,
  transformHarmonyAddress,
  transformOptimismAddress,
  transformArbitrumAddress,
  transformCeloAddress,
  stripTokenHeader,
  getFixBalancesSync,
  transformBalances,
  transformDexBalances,
};
