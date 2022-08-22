const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const IOTEX_CG_MAPPING = require("./../xdollar-finance/iotex_cg_mapping.json");
const BigNumber = require("bignumber.js");
const {
  transformTokens,
  fixBalancesTokens,
} = require('./tokenMapping')

const nullAddress = '0x0000000000000000000000000000000000000000'

async function transformFantomAddress() {
  const multichainTokens = (await utils.fetchURL(
    "https://netapi.anyswap.net/bridge/v2/info"
  )).data.bridgeList;

  const mapping = tranformTokens.fantom

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
    const map = transformTokens.avax;
    return map[addr.toLowerCase()] || `avax:${addr}`;
  };
}

async function transformBscAddress() {
  return transformChainAddress(transformTokens.bsc, "bsc")
}

async function transformPolygonAddress() {
  return transformChainAddress(transformTokens.polygon, "polygon")
}

async function transformXdaiAddress() {
  return transformChainAddress(transformTokens.xdai, "xdai")
}

async function transformOkexAddress() {
  // const okexBridge = (
  //   await utils.fetchURL(
  //     "https://www.okex.com/v2/asset/cross-chain/currencyAddress"
  //   )
  // ).data.data.tokens; TODO
  return transformChainAddress(transformTokens.okexchain, "okexchain")
}

async function transformHecoAddress() {
  return transformChainAddress(transformTokens.heco, "heco")
}

async function transformHooAddress() {
  return transformChainAddress(transformTokens.hoo, "hoo")
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

async function transformMoonriverAddress() {
  return transformChainAddress(transformTokens.moonriver, "moonriver");
}

async function transformMoonbeamAddress() {
  return transformChainAddress(transformTokens.moonbeam, "moonbeam");
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

async function transformFuseAddress() {
  return transformChainAddress(transformTokens.fuse, "fuse")
}

async function transformEvmosAddress() {
  return transformChainAddress(transformTokens.evmos, "evmos")
}

function fixAvaxBalances(balances) {
  return fixBalances(balances, fixBalancesTokens.avax)
}

function transformOasisAddressBase(addr) {
  const map = transformTokens.oasis;
  return map[addr.toLowerCase()] || `${addr}`;
}

async function transformOasisAddress() {
  return transformOasisAddressBase;
}

function fixBscBalances(balances) {
  return fixBalances(balances, fixBalancesTokens.bsc)
}

function fixOasisBalances(balances) {
  return fixBalances(balances, fixBalancesTokens.oasis)
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

async function transformKccAddress() {
  return transformChainAddress(transformTokens.kcc, "kcc")
}

function transformMetisAddress() {
  return transformChainAddress(transformTokens.metis, "metis")
}

function transformBobaAddress() {
  return transformChainAddress(transformTokens.boba, "boba")
}

function transformNearAddress() {
  return addr => {
    const bridgedAssetIdentifier = ".factory.bridge.near";
    if (addr.endsWith(bridgedAssetIdentifier))
      return `0x${addr.slice(0, addr.length - bridgedAssetIdentifier.length)}`;

    return addr
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


const fixBalancesMapping = {};

for (const chain of Object.keys(fixBalancesTokens)) {
  fixBalancesMapping[chain] = b => fixBalances(b, fixBalancesTokens[chain])
}

function transformTelosAddress() {
  return (addr) => {
    if (compareAddresses(addr, "0x0000000000000000000000000000000000000000")) {
      return "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000"; // WETH
    }
    const map = {
      "0x017043607270ecbb440e20b0f0bc5e760818b3d8": "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // sBUSD(Aurora) -> BUSD(BSC)
    }
    return map[addr.toLowerCase()] || `telos:${addr}`
  }
}

const chainTransforms = {
  fuse: transformFuseAddress,
  celo: transformCeloAddress,
  evmos: transformEvmosAddress,
  fantom: transformFantomAddress,
  bsc: transformBscAddress,
  boba: transformBobaAddress,
  polygon: transformPolygonAddress,
  xdai: transformXdaiAddress,
  avax: transformAvaxAddress,
  heco: transformHecoAddress,
  hoo: transformHooAddress,
  harmony: transformHarmonyAddress,
  optimism: transformOptimismAddress,
  moonriver: transformMoonriverAddress,
  okex: transformOkexAddress,
  kcc: transformKccAddress,
  arbitrum: transformArbitrumAddress,
  iotex: transformIotexAddress,
  metis: transformMetisAddress,
  near: transformNearAddress,
  moonbeam: transformMoonbeamAddress,
  ethereum: transformEthereumAddress,
  oasis: transformOasisAddress,
  reichain: transformReichainAddress,
  telos: transformTelosAddress,
};

async function transformReichainAddress() {
  const mapping = {
    "0xDD2bb4e845Bd97580020d8F9F58Ec95Bf549c3D9":
      "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // killswitch busd -> busd token
    "0xf8ab4aaf70cef3f3659d3f466e35dc7ea10d4a5d":
      "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // killswitch bnb -> bnb token
  };

  return transformChainAddress(mapping, "reichain", { skipUnmapped: true });
}

async function transformEthereumAddress() {
  return transformChainAddress(transformTokens.ethereum, "ethereum");
}

function transformChainAddress(
  mapping = {},
  chain,
  { skipUnmapped = false, chainName = "" } = {}
) {
  normalizeMapping(mapping);

  return addr => {
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
    if (addr.startsWith('0x')) return `${chain}:${addr}`
    return addr
  };
}

module.exports = {
  getChainTransform,
  getFixBalances,
  transformCeloAddress,
  transformFantomAddress,
  transformBscAddress,
  transformPolygonAddress,
  transformXdaiAddress,
  transformAvaxAddress,
  transformHecoAddress,
  transformHarmonyAddress,
  transformOptimismAddress,
  transformMoonriverAddress,
  fixAvaxBalances,
  transformOkexAddress,
  transformKccAddress,
  transformArbitrumAddress,
  fixBscBalances,
  transformIotexAddress,
  transformMetisAddress,
  transformBobaAddress,
  transformNearAddress,
  transformMoonbeamAddress,
  transformEthereumAddress,
  transformOasisAddress,
  transformOasisAddressBase,
  transformEvmosAddress,
  stripTokenHeader,
  transformTelosAddress,
};
