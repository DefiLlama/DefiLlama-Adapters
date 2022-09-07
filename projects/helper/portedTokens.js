const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const IOTEX_CG_MAPPING = require("./../xdollar-finance/iotex_cg_mapping.json");
const BigNumber = require("bignumber.js");
const {
  transformTokens,
  fixBalancesTokens,
} = require('./tokenMapping')

async function transformFantomAddress() {
  const multichainTokens = (await utils.fetchURL(
    "https://netapi.anyswap.net/bridge/v2/info"
  )).data.bridgeList;

  const mapping = transformTokens.fantom

  return addr => {
    addr = addr.toLowerCase()
    const srcToken = multichainTokens.find(
      token => token.chainId === "250" && token.token === addr.toLowerCase()
    );
    if (srcToken !== undefined) {
      if (srcToken.srcChainId === "1") {
        return srcToken.srcToken;
      } else if (srcToken.srcChainId === "56") {
        if (srcToken.srcToken === "") {
          return "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
        }
        return `bsc:${srcToken.srcToken}`;
      }
    }
    return mapping[addr] || `fantom:${addr}`;
  };
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
    if (map[addr.toLowerCase()])  return map[addr.toLowerCase()]
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
    if (dstToken !== undefined) {
      return dstToken.extensions.bridgeInfo[1].tokenAddress;
    }
    return `arbitrum:${addr}`;
  };
}

async function transformIotexAddress() {
  return addr => {
    const dstToken = Object.keys(IOTEX_CG_MAPPING).find(token =>
      compareAddresses(addr, token)
    );
    if (dstToken !== undefined) {
      return (
        IOTEX_CG_MAPPING[dstToken].contract ||
        IOTEX_CG_MAPPING[dstToken].coingeckoId
      );
    }
    return `iotex:${addr}`;
  };
}

function normalizeMapping(mapping) {
  Object.keys(mapping).forEach(
    key => (mapping[key.toLowerCase()] = mapping[key])
  );
}

function fixBalances(balances, mapping, { removeUnmapped = false } = {}) {
  normalizeMapping(mapping);

  Object.keys(balances).forEach(token => {
    const tokenKey = stripTokenHeader(token).toLowerCase();
    const { coingeckoId, decimals } = mapping[tokenKey] || {};
    if (!coingeckoId) {
      if (removeUnmapped && tokenKey.startsWith('0x')) {
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

function stripTokenHeader(token) {
  token = token.toLowerCase();
  return token.indexOf(":") > -1 ? token.split(":")[1] : token;
}

async function getFixBalances(chain) {
  const dummyFn = i => i;
  return fixBalancesMapping[chain] || dummyFn;
}

function getFixBalancesSync(chain) {
  const dummyFn = i => i;
  return fixBalancesMapping[chain] || dummyFn;
}

const fixBalancesMapping = {};

for (const chain of Object.keys(fixBalancesTokens)) {
  fixBalancesMapping[chain] = b => fixBalances(b, fixBalancesTokens[chain])
}

const chainTransforms = {
  fantom: transformFantomAddress,
  bsc: transformBscAddress,
  polygon: transformPolygonAddress,
  avax: transformAvaxAddress,
  harmony: transformHarmonyAddress,
  optimism: transformOptimismAddress,
  arbitrum: transformArbitrumAddress,
  iotex: transformIotexAddress,
};

function transformChainAddress(
  mapping = {},
  chain,
  { skipUnmapped = false, chainName = "" } = {}
) {
  normalizeMapping(mapping);

  return addr => {
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
    if (chain === 'ethereum')  return mapping[addr] ? mapping[addr] : addr
    return mapping[addr] || `${chain}:${addr}`;
  };
}

async function getChainTransform(chain) {
  if (chainTransforms[chain]) 
    return chainTransforms[chain]()

  if (transformTokens[chain]) 
    return transformChainAddress(transformTokens[chain], chain) 

  return addr => {
    addr = addr.toLowerCase()
    if (addr.startsWith('0x')) return `${chain}:${addr}`
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
  transformIotexAddress,
  stripTokenHeader,
  getFixBalancesSync,
  transformBalances,
};
